const chai = require("chai");
chai.should();

const cronMessageBuilder = require("../../../src/messageBuilders/cronMessageBuilder");
const getHeartbeatHandler = require("../../../src/handlers/heartbeat");

let executeCalled;
const heartbeatConfig = {
  "destination": {
    "execute"() {
      executeCalled = true;
      return Promise.resolve();
    }
  }
};

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
    const heartbeatHandler = getHeartbeatHandler(heartbeatConfig);

    executeCalled = false;
    return heartbeatHandler(message, success, retry, fail).then(returnedValue => {
      executeCalled.should.be.true;
      returnedValue.should.equal("success returned");
    });
  });
});
