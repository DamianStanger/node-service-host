/* eslint-disable no-undefined */
const chai = require("chai");
const expect = chai.expect;
chai.should();

const Readable = require("stream").Readable;

const messageBuilder = require("../../src/messageBuilders/messageBuilder");
const getDecodeTransformer = require("../../src/decodeTransformer");


function getReadStreamWithMessaage(message) {
  return new Readable({
    "objectMode": true,
    "highWaterMark": 1,
    read() {
      this.push(message);
      this.push(null);
    }
  });
}


describe("decodeTransformer", () => {
  it("should do nothing if there is no payload", () => {
    const originalMessage = messageBuilder().withPayload(undefined).build();
    const readStream = getReadStreamWithMessaage(originalMessage);

    const decodeTransformer = getDecodeTransformer();
    decodeTransformer.on("data", message => {
      expect(message.payload).to.be.undefined;
    });

    readStream.pipe(decodeTransformer);
  });

  it("should do nothing if the payload is an object", () => {
    const originalMessage = messageBuilder().withPayload({"foo": "bar"}).build();
    const readStream = getReadStreamWithMessaage(originalMessage);

    const decodeTransformer = getDecodeTransformer();
    decodeTransformer.on("data", message => {
      message.payload.should.deep.equal({"foo": "bar"});
    });

    readStream.pipe(decodeTransformer);
  });

  it("should do nothing if the payload is a none base64 encoded string", () => {
    const originalMessage = messageBuilder().withPayload("FooBar").build();
    const readStream = getReadStreamWithMessaage(originalMessage);

    const decodeTransformer = getDecodeTransformer();
    decodeTransformer.on("data", message => {
      message.payload.should.equal("FooBar");
    });

    readStream.pipe(decodeTransformer);
  });

  it("should decode the payload to an object from a base 64 encoded string", () => {
    const originalMessage = messageBuilder().withPayload("eyJmb28iOiAiYmFyIiwgIm9iaiI6IHsiZml6eiI6IDEyMzQuNTY3OH19").build();
    const readStream = getReadStreamWithMessaage(originalMessage);

    const decodeTransformer = getDecodeTransformer();
    decodeTransformer.on("data", message => {
      message.payload.should.deep.equal({"foo": "bar", "obj": {"fizz": 1234.5678}});
    });

    readStream.pipe(decodeTransformer);
  });
});
