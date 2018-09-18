const chai = require("chai");
chai.should();

const cronMessageBuilder = require("../../../src/messageBuilders/cronMessageBuilder");
const heartbeatHandler = require("../../../src/handlers/heartbeat");


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
    const returnedValue = heartbeatHandler(message, success, retry, fail);
    returnedValue.should.equal("success returned");
  });
});
