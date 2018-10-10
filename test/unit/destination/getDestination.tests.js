const chai = require("chai");
chai.should();

const getDestination = require("../../../src/destination/getDestination");


describe("getDestination", () => {
  it("should pass the parameters to the destination", () => {
    const message = {"foo": "bar"};
    const subject = "mySubject";
    const destinationParameters = {"param2": 3};

    const result = getDestination({
      "destination": "../../test/unit/destination/testDestination",
      destinationParameters
    });

    return result.execute(message, subject).then(obj => {
      obj.message.should.equal(message);
      obj.subject.should.equal(subject);
      obj.config.should.equal(destinationParameters);
    });
  });

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
