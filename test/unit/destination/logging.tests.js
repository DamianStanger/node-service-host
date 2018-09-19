const chai = require("chai");
chai.should();

const getLoggingDestination = require("../../../src/destination/logging");


describe("destination/logging", () => {
  it("should return a resolved promise when execute is called", () => {
    const logging = getLoggingDestination();

    return logging.execute().then(() => {
      // assertions go here
    });
  });
});
