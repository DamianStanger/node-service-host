const chai = require("chai");
chai.should();

const cronMessageBuilder = require("../../../src/messageBuilders/cronMessageBuilder");
const getHeartbeatHandler = require("../../../src/handlers/heartbeat");


let executeCalled;
let executedWithMessage;
let executedWithSubject;
function getHeartbeatConfig(errorToThrow) {
  executeCalled = false;
  executedWithMessage = undefined;
  executedWithSubject = undefined;
  return {
    "destination": {
      "execute"(message, subject) {
        executeCalled = true;
        executedWithMessage = message;
        executedWithSubject = subject;
        if (errorToThrow) {
          return Promise.reject(errorToThrow);
        }
        return Promise.resolve();
      }
    }
  };
}

function success(message) {
  return {"name": "success returned", message};
}
function retry() {
  return "retry returned";
}
function fail(error, message) {
  return {"name": "fail returned", error, message};
}


describe("heartbeat handler", () => {
  it("should return success", () => {
    const message = cronMessageBuilder().build();
    const heartbeatHandler = getHeartbeatHandler(getHeartbeatConfig());

    return heartbeatHandler(message, success, retry, fail).then(returnedValue => {
      executeCalled.should.be.true;
      returnedValue.name.should.equal("success returned");
      returnedValue.message.should.equal(message);
    });
  });

  it("should pass the message and subject to the destination", () => {
    const message = cronMessageBuilder().build();
    const heartbeatHandler = getHeartbeatHandler(getHeartbeatConfig());

    return heartbeatHandler(message, success, retry, fail).then(() => {
      executedWithMessage.should.equal(message);
      executedWithSubject.should.equal(`${message.eventName}|${message.payload.timestamp.toISOString()}|${message.correlationId}`);
    });
  });

  it("should call fail when an error is thrown by the destination", () => {
    const message = cronMessageBuilder().build();
    const errorToThrow = new Error("This is an error!");
    const heartbeatHandler = getHeartbeatHandler(getHeartbeatConfig(errorToThrow));

    return heartbeatHandler(message, success, retry, fail).then(returnedValue => {
      returnedValue.name.should.equal("fail returned");
      returnedValue.error.should.equal(errorToThrow);
      returnedValue.message.should.equal(message);
    });
  });
});
