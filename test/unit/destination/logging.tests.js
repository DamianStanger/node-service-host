const chai = require("chai");
chai.should();

const getLoggingDestination = require("../../../src/destination/logging");
const messageBuilder = require("../../../src/messageBuilders/messageBuilder");


describe("destination/logging", () => {
  it("should return a resolved promise when execute is called", () => {
    const logging = getLoggingDestination();
    const message = messageBuilder().build();

    return logging.execute(message, "mySubject").then(() => {
      // assertions go here
    });
  });
});
