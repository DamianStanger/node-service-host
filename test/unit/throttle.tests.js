const chai = require("chai");
chai.should();
const {Readable} = require("stream");

const throttle = require("../../src/throttle");
const messageBuilder = require("../../src/messageBuilders/messageBuilder");
const controlMessageBuilder = require("../../src/messageBuilders/controlMessageBuilder");
const wait = require("../../src/utils/wait");


const standardConfig = {
  "millisecondsToWaitOnNoMessages": 0,
  "millisecondsToWaitOnError": 0,
  "maxProcessingConcurrency": 2
};

function getReadStreamWithMessaages(messages) {
  return new Readable({
    "objectMode": true,
    "highWaterMark": 1,
    read() {
      messages.forEach(message => {
        this.push(message);
      });
      this.push(null);
    }
  });
}

let resolvedMessages;

function getMessageDelegator() {
  resolvedMessages = [];
  return function (message) {
    return new Promise(resolve => {

      resolvedMessages.push(message);
      resolve(message);
    });
  };
}


describe("throttle", () => {
  it("should call the message delegator passing the message", () => {
    const message = messageBuilder().build();
    const readStream = getReadStreamWithMessaages([message]);
    const messageDelegator = getMessageDelegator();

    throttle(readStream, messageDelegator, standardConfig);
    readStream.read();

    readStream.isPaused().should.be.false;
    resolvedMessages.length.should.equal(1);
    resolvedMessages[0].should.equal(message);
  });

  it("should pause the read stream when processing the max number of concurrent messages", () => {
    const message1 = messageBuilder().build();
    const message2 = messageBuilder().build();
    const message3 = messageBuilder().build();
    const readStream = getReadStreamWithMessaages([message1, message2, message3]);
    const messageDelegator = getMessageDelegator();

    throttle(readStream, messageDelegator, standardConfig);
    readStream.read();

    while (!readStream.isPaused()) {
      readStream.read();
    }
    readStream.isPaused().should.be.true;
    resolvedMessages.length.should.equal(2);
    resolvedMessages[0].should.equal(message1);
    resolvedMessages[1].should.equal(message2);
  });

  it("should resume the read stream when a message completes its processing", () => {
    const message1 = messageBuilder().build();
    const message2 = messageBuilder().build();
    const message3 = messageBuilder().build();
    const readStream = getReadStreamWithMessaages([message1, message2, message3]);
    const messageDelegator = getMessageDelegator();

    throttle(readStream, messageDelegator, standardConfig);
    readStream.read();
    while (!readStream.isPaused()) {
      readStream.read();
    }
    readStream.isPaused().should.be.true;
    resolvedMessages.length.should.equal(2);
    resolvedMessages[0].should.equal(message1);
    resolvedMessages[1].should.equal(message2);

    return wait(5).then(() => {
      readStream.isPaused().should.be.false;
      resolvedMessages.length.should.equal(3);
      resolvedMessages[2].should.equal(message3);
    });
  });


  describe("When a control message is received", () => {
    describe("Which indicates no messages to process", () => {
      it("should pause the read stream for 10 milliseconds", () => {
        const controlMessage = controlMessageBuilder().build();
        const message = messageBuilder().build();
        const readStream = getReadStreamWithMessaages([controlMessage, message]);
        const messageDelegator = getMessageDelegator();

        const customConfig = Object.assign({}, standardConfig, {"millisecondsToWaitOnNoMessages": 10});
        throttle(readStream, messageDelegator, customConfig);
        readStream.read();

        readStream.isPaused().should.be.true;
        resolvedMessages.length.should.equal(0);

        // Im using 7 milliseconds to give the timing a little leaway in processing and timing
        return wait(7).then(() => {
          readStream.isPaused().should.be.true;
          resolvedMessages.length.should.equal(0);

          return wait(7).then(() => {
            readStream.isPaused().should.be.false;
            resolvedMessages.length.should.equal(1);
            resolvedMessages[0].should.equal(message);
          });
        });
      });
    });

    describe("Which indicates an error occurred", () => {
      it("should pause the read stream for 10 milliseconds", () => {
        const controlMessage = controlMessageBuilder().withPayload({"error": new Error("foobar")}).build();
        const message = messageBuilder().build();
        const readStream = getReadStreamWithMessaages([controlMessage, message]);
        const messageDelegator = getMessageDelegator();

        const customConfig = Object.assign({}, standardConfig, {"millisecondsToWaitOnError": 10});
        throttle(readStream, messageDelegator, customConfig);
        readStream.read();

        readStream.isPaused().should.be.true;
        resolvedMessages.length.should.equal(0);

        // Im using 7 milliseconds to give the timing a little leaway in processing and timing
        return wait(7).then(() => {
          readStream.isPaused().should.be.true;
          resolvedMessages.length.should.equal(0);

          return wait(7).then(() => {
            readStream.isPaused().should.be.false;
            resolvedMessages.length.should.equal(1);
            resolvedMessages[0].should.equal(message);
          });
        });
      });
    });
  });
});
