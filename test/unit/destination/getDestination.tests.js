const chai = require("chai");
chai.should();

const getDestination = require("../../../src/destination/getDestination");


describe("getDestination", () => {
  it("should return an instance of logging", () => {
    const result = getDestination({"destination": "logging"});

    result.should.be.an("object");
    result.execute.should.be.a("function");
  });

  it("should return an instance of sqs", () => {
    const result = getDestination({"destination": "sqs"});

    result.should.be.an("object");
    result.execute.should.be.a("function");
  });

  it("should return an instance of sns", () => {
    const result = getDestination({"destination": "sns"});

    result.should.be.an("object");
    result.execute.should.be.a("function");
  });

  it("should return the object already in config.destination", () => {
    const fakeDestination = {"foo": "bar"};
    const result = getDestination({"destination": fakeDestination});

    result.should.equal(fakeDestination);
  });
});
