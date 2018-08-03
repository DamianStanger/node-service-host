const sinon = require("sinon");
const chai = require("chai");
const assert = chai.assert;
chai.should();

const getReadStream = require("../../../src/source/readStream");
const messageBuilder = require("../../../src/source/messageBuilder");


const defaultConfig = {
  "readHighWaterMark": 1
};

describe.only("readStream", () => {
  describe("When the source has no messages to process", () => {
    it("should send a control message to the pipe", () => {
      let error;
      let data;
      const source = {
        "deleteMessage": sinon.fake(),
        "receiveMessage": fn => fn(error, data)
      };

      const readStream = getReadStream(defaultConfig, source);

      const expectedControlMessage = messageBuilder()
        .withPayload({"reason": "receiveMessageBatch got no results from aws, sorry!"})
        .buildControlMessage();

      const dataPromise = new Promise(resolve => {
        readStream.on("data", message => {
          message.should.deep.equal(expectedControlMessage);
          source.deleteMessage.called.should.be.false;
          readStream.pause();
          resolve();
        });
      });

      readStream.read();
      return dataPromise;
    });
  });

  describe("When the source returns an error", () => {
    it("should send a control message to the pipe", () => {
      const error = new Error("This is an important error!");
      let data;
      const source = {
        "deleteMessage": sinon.fake(),
        "receiveMessage": fn => fn(error, data)
      };

      const readStream = getReadStream(defaultConfig, source);

      const expectedControlMessage = messageBuilder()
        .withPayload({
          "error": error,
          "reason": "receiveMessageBatch got an error from the source"
        })
        .buildControlMessage();

      const dataPromise = new Promise(resolve => {
        readStream.on("data", message => {
          message.should.deep.equal(expectedControlMessage);
          source.deleteMessage.called.should.be.false;
          readStream.pause();
          resolve();
        });
      });

      readStream.read();
      return dataPromise;
    });
  });

  function buildSqsMessage(messages) {
    return {
      "Messages": messages.map(msg => ({
        "Body": JSON.stringify(msg),
        "ReceiptHandle": "1234",
        "attributes": msg.attributes
      }))
    };
  }

  describe("When the source returns messages", () => {
    it("should convert and push messages down the pipe", () => {
      let error;

      const message1 = messageBuilder().withEventName("a").withVersion(1).withPayload(111).build();
      const message2 = messageBuilder().withEventName("b").withVersion(2).withPayload(222).build();
      const messages = [message1, message2];
      const data = buildSqsMessage(messages);

      const source = {
        "deleteMessage": sinon.fake(),
        "receiveMessage": fn => fn(error, data)
      };

      const readStream = getReadStream(defaultConfig, source);

      const dataPromise = new Promise(resolve => {
        readStream.on("data", message => {
          const nextMessage = messages.shift();
          nextMessage.ReceiptHandle = "1234";
          message.should.deep.equal(nextMessage);
          source.deleteMessage.called.should.be.false;
          if (messages.length <= 0) {
            readStream.pause();
            resolve();
          }
        });
      });

      readStream.read();
      return dataPromise;
    });
  });

  describe("the success function", () => {
    it("should exist", () => {
      const readStream = getReadStream({}, {});
      (typeof (readStream.success)).should.equals("function");
    });

    it("should call deleteMessage", () => {
      const message = messageBuilder().build();
      const source = {
        "deleteMessage": (msg, fn) => fn()
      };
      const readStream = getReadStream(defaultConfig, source);

      return readStream.success(message)
        .then(msg => {
          msg.should.equal(message);
        });
    });

    describe("when the deleteMessage passes an error", () => {
      it("should reject the promise", () => {
        const message = messageBuilder().build();
        const thrownError = new Error("FooBar");
        const source = {
          "deleteMessage": (msg, fn) => fn(thrownError)
        };
        const readStream = getReadStream(defaultConfig, source);

        return readStream.success(message)
          .then(() => {
            assert.fail("should reject the promise");
          })
          .catch(err => {
            err.should.equal(thrownError);
          });
      });
    });
  });

  describe("the ignore function", () => {
    it("should exist", () => {
      const readStream = getReadStream({}, {});
      (typeof (readStream.ignore)).should.equals("function");
    });

    it("should call deleteMessage", () => {
      const message = messageBuilder().build();
      const source = {
        "deleteMessage": (msg, fn) => fn()
      };
      const readStream = getReadStream(defaultConfig, source);

      return readStream.ignore(message)
        .then(msg => {
          msg.should.equal(message);
        });
    });
  });

  describe("the retry function", () => {
    it("should exist", () => {
      const readStream = getReadStream({}, {});
      (typeof (readStream.retry)).should.equals("function");
    });

    it("should do nothing (yet)", () => {
      const readStream = getReadStream({}, {});
      readStream.retry({}, {});
    });
  });

  describe("the fail function", () => {
    it("should have a fail function", () => {
      const readStream = getReadStream({}, {});
      (typeof (readStream.fail)).should.equals("function");
    });

    it("should do nothing (yet)", () => {
      const readStream = getReadStream({}, {});
      readStream.fail({}, {});
    });
  });
});
