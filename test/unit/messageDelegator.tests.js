const sinon = require("sinon");
const chai = require("chai");
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
    const handlersPromise = new Promise(resolve => resolve(42));
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

  it("should call fail when the handlers promise is rejected", () => {
    const theError = new Error(42);
    const handlersPromise = new Promise((resolve, reject) => reject(theError));
    const mockHandler = sinon.fake.returns(handlersPromise);
    const mockReadStream = {
      "ignore": sinon.fake(),
      "fail": sinon.fake.returns(43)
    };
    const message = messageBuilder().build();

    const messageDelegator = getMessageDelegator(mockReadStream);
    messageDelegator.registerHandler(mockHandler, message.eventName, message.version);
    const actual = messageDelegator.process(message);

    return actual.then(result => {
      mockReadStream.ignore.called.should.be.false;
      mockReadStream.fail.calledOnce.should.be.true;
      mockReadStream.fail.calledWith(message, theError).should.be.true;
      result.should.equal(43);
    });
  });
});
