const sinon = require("sinon");
const chai = require("chai");
chai.should();

const getReadStream = require("../../../src/source/readStream");
const messageBuilder = require("../../../src/source/messageBuilder");


const defaultConfig = {
  "readHighWaterMark": 1
};

describe("readStream", () => {
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
});
