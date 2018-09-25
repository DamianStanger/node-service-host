/* eslint-disable no-undefined */
const chai = require("chai");
chai.should();

const cronMessageBuilder = require("../../../src/messageBuilders/cronMessageBuilder");
const getHeartbeatHandler = require("../../../src/handlers/heartbeat");

let executeCalled;
let executedWithMessage;
let executedWithSubject;
function getHeartbeatConfig() {
  executeCalled = false;
  executedWithMessage = undefined;
  executedWithSubject = undefined;
  return {
    "destination": {
      "execute"(message, subject) {
        executeCalled = true;
        executedWithMessage = message;
        executedWithSubject = subject;
        return Promise.resolve();
      }
    }
  };
}

function success() {
  return "success returned";
}
function retry() {
  return "retry returned";
}
function fail() {
  return "fail returned";
}


describe("heartbeat handler", () => {
  it("should return success", () => {
    const message = cronMessageBuilder().build();
    const heartbeatHandler = getHeartbeatHandler(getHeartbeatConfig());

    return heartbeatHandler(message, success, retry, fail).then(returnedValue => {
      executeCalled.should.be.true;
      returnedValue.should.equal("success returned");
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
});
