const sinon = require("sinon");
const chai = require("chai");
const assert = chai.assert;
chai.should();

const getMessageDelegator = require("../../src/messageDelegator");
const messageBuilder = require("../../src/source/messageBuilder");


describe("messageDelegator", () => {
  it("should call ignore on the readStream when no handlers are configured", () => {
    const mockReadStream = {"ignore": sinon.fake()};
    const message = messageBuilder().build();

    const messageDelegator = getMessageDelegator(mockReadStream);
    messageDelegator.process(message);

    mockReadStream.ignore.calledOnce.should.be.true;
  });

  it("should return the handlers promise when a handler is matched", () => {
    const handlersPromise = Promise.resolve(42);
    const mockHandler = sinon.fake.returns(handlersPromise);
    const mockReadStream = {
      "ignore": sinon.fake(),
      "fail": sinon.fake()
    };
    const message = messageBuilder().build();

    const messageDelegator = getMessageDelegator(mockReadStream);
    messageDelegator.registerHandler(mockHandler, message.eventName, message.version);
    const actual = messageDelegator.process(message);

    return actual.then(result => {
      mockReadStream.ignore.called.should.be.false;
      mockReadStream.fail.called.should.be.false;
      result.should.equal(42);
    });
  });

  it("should call retry when the handlers promise is rejected", () => {
    const theError = new Error(42);
    const handlersPromise = new Promise((resolve, reject) => reject(theError));
    const mockHandler = sinon.fake.returns(handlersPromise);
    const mockReadStream = {
      "ignore": sinon.fake(),
      "retry": sinon.fake.returns(43)
    };
    const message = messageBuilder().build();

    const messageDelegator = getMessageDelegator(mockReadStream);
    messageDelegator.registerHandler(mockHandler, message.eventName, message.version);
    const actual = messageDelegator.process(message);

    return actual.then(result => {
      mockReadStream.ignore.called.should.be.false;
      mockReadStream.retry.calledOnce.should.be.true;
      mockReadStream.retry.calledWith(message).should.be.true;
      result.should.equal(43);
    });
  });

  it("should throw an exception if two handlers with same event and version are registered", () => {
    const mockHandler1 = sinon.fake();
    const mockHandler2 = sinon.fake();
    const mockReadStream = {};
    const eventName = "event1";
    const version = 1.234;

    const messageDelegator = getMessageDelegator(mockReadStream);
    messageDelegator.registerHandler(mockHandler1, eventName, version);
    try {
      messageDelegator.registerHandler(mockHandler2, eventName, version);
      assert.fail("regiserHandler should have failed");
    } catch (err) {
      err.message.should.equal("A handler already exists for the event:event1 version:1.234");
    }
  });

  it("should use the messages version number to run the right handler", () => {
    const handlersPromise = Promise.resolve(25);
    const mockHandler1 = sinon.fake();
    const mockHandler2 = sinon.fake.returns(handlersPromise);
    const mockReadStream = {};
    const message = messageBuilder().withVersion(2.5).build();

    const messageDelegator = getMessageDelegator(mockReadStream);
    messageDelegator.registerHandler(mockHandler1, message.eventName, 2);
    messageDelegator.registerHandler(mockHandler2, message.eventName, 2.5);
    const actual = messageDelegator.process(message);

    return actual.then(result => {
      result.should.equal(25);
    });
  });

  it("should use the undefined version handler if no handler exists for that exact version", () => {
    const handlersPromise = Promise.resolve(69);
    const mockHandler = sinon.fake.returns(handlersPromise);
    const mockReadStream = {};
    const message = messageBuilder().withVersion(4).build();
    let undefinedVersion;

    const messageDelegator = getMessageDelegator(mockReadStream);
    messageDelegator.registerHandler(mockHandler, message.eventName, undefinedVersion);
    const actual = messageDelegator.process(message);

    return actual.then(result => {
      result.should.equal(69);
    });
  });

});
