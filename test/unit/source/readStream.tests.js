const sinon = require("sinon");
const chai = require("chai");
const assert = chai.assert;
chai.should();

const Writable = require("stream").Writable;

const getReadStream = require("../../../src/source/readStream");
const messageBuilder = require("../../../src/source/messageBuilder");
const controlMessageBuilder = require("../../../src/source/controlMessageBuilder");


const defaultConfig = {
  "readHighWaterMark": 1
};

describe("readStream", () => {
  describe("when the source has no messages to process", () => {
    it("should send a control message to the pipe", () => {
      let data;
      const source = {
        "receiveMessage": () => Promise.resolve(data)
      };

      const readStream = getReadStream(defaultConfig, source);

      const expectedControlMessage = controlMessageBuilder()
        .withPayload({"reason": "receiveMessageBatch got no results from the source, sorry!"})
        .build();

      const dataPromise = new Promise(resolve => {
        readStream.on("data", message => {
          message.should.deep.equal(expectedControlMessage);
          readStream.pause();
          resolve();
        });
      });

      readStream.read();
      return dataPromise;
    });
  });

  describe("when the source returns an error", () => {
    it("should send a control message to the pipe", () => {
      const error = new Error("This is an important error!");
      const source = {
        "receiveMessage": () => Promise.reject(error)

      };

      const readStream = getReadStream(defaultConfig, source);

      const expectedControlMessage = controlMessageBuilder()
        .withPayload({
          "error": error,
          "reason": "receiveMessageBatch got an error from the source"
        })
        .build();

      const dataPromise = new Promise(resolve => {
        readStream.on("data", message => {
          message.should.deep.equal(expectedControlMessage);
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

  describe("when the source returns messages", () => {
    it("should convert and push messages down the pipe", () => {
      const message1 = messageBuilder().withEventName("a").withVersion(1).withPayload(111).build();
      const message2 = messageBuilder().withEventName("b").withVersion(2).withPayload(222).build();
      const messages = [message1, message2];
      const data = buildSqsMessage(messages);

      const source = {
        "receiveMessage": sinon.fake.returns(Promise.resolve(data))
      };

      const readStream = getReadStream(defaultConfig, source);

      const dataPromise = new Promise(resolve => {
        readStream.on("data", message => {
          const nextMessage = messages.shift();
          nextMessage.ReceiptHandle = "1234";
          message.should.deep.equal(nextMessage);
          if (messages.length <= 0) {
            readStream.pause();
            resolve();
          }
        });
      });

      readStream.read();
      return dataPromise;
    });

    describe("and the source takes a while to process the first request", () => {
      it("should not call receiveMessage again until the first is done", () => {
        const dataPromise = new Promise((resolve, reject) => {
          const message1 = messageBuilder().withEventName("a").withVersion(1).withPayload(111).build();
          const message2 = messageBuilder().withEventName("b").withVersion(2).withPayload(222).build();
          const message3 = messageBuilder().withEventName("c").withVersion(3).withPayload(333).build();
          const message4 = messageBuilder().withEventName("d").withVersion(4).withPayload(444).build();
          const data = [buildSqsMessage([message1, message2, message3]), buildSqsMessage([message4])];

          let received = 0;
          const readSource = {
            "receiveMessage": () => new Promise(receiveMessageResolve => {
              received++;
              // console.log(received, "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
              setImmediate(() => {
                // console.log(received, "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
                if (received !== 1) {
                  assert.fail(`There should only be one of these processing at any one time. ${received} !== 1`);
                }
                received--;
                receiveMessageResolve(data.shift());
              });
            })
          };

          const readStream = getReadStream(defaultConfig, readSource);
          let dataComplete = 0;
          const writable = new Writable({
            "objectMode": true,
            "highWatermark": 10,
            "write": (message, encoding, next) => {
              try {
                dataComplete++;
                // console.log(dataComplete, data.length, message, "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                if (dataComplete <= 3) {
                  data.length.should.equal(1);
                } else if (dataComplete === 4) {
                  data.length.should.equal(0);
                }

                if (dataComplete >= 4) {
                  readStream.pause();
                  resolve();
                  return;
                }
                next();
              } catch (err) {
                reject(err);
              }
            }
          });
          readStream.pipe(writable);
          readStream.read();
        });

        return dataPromise;
      });
    });
  });

  describe("the success function", () => {
    it("should exist", () => {
      const readStream = getReadStream({}, {});
      (typeof (readStream.success)).should.equals("function");
    });

    it("should call success on the source", () => {
      const message = messageBuilder().build();
      const source = {
        "success": msg => Promise.resolve(msg)
      };
      const readStream = getReadStream(defaultConfig, source);

      return readStream.success(message)
        .then(msg => {
          msg.should.equal(message);
        });
    });
  });

  describe("the ignore function", () => {
    it("should exist", () => {
      const readStream = getReadStream({}, {});
      (typeof (readStream.ignore)).should.equals("function");
    });

    it("should call ignore on the source", () => {
      const message = messageBuilder().build();
      const source = {
        "ignore": msg => Promise.resolve(msg)
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

    it("should call retry on the source", () => {
      const message = messageBuilder().build();
      const source = {
        "retry": msg => Promise.resolve(msg)
      };
      const readStream = getReadStream(defaultConfig, source);

      return readStream.retry(message)
        .then(msg => {
          msg.should.equal(message);
        });
    });

  });

  describe("the fail function", () => {
    it("should have a fail function", () => {
      const readStream = getReadStream({}, {});
      (typeof (readStream.fail)).should.equals("function");
    });

    it("should call fail on the source", () => {
      const message = messageBuilder().build();
      const source = {
        "fail": msg => Promise.resolve(msg)
      };
      const readStream = getReadStream(defaultConfig, source);

      return readStream.fail(message)
        .then(msg => {
          msg.should.equal(message);
        });
    });

  });
});
