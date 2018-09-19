const chai = require("chai");
chai.should();

const getSqsDestination = require("../../../src/destination/sqs");


describe("destination/sqs", () => {
  it("should return a resolved promise when execute is called", () => {
    const sqs = getSqsDestination();

    return sqs.execute().then(() => {
      // assertions go here
    });
  });
});
