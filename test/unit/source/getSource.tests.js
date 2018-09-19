const chai = require("chai");
chai.should();

const getSource = require("../../../src/source/getSource");


describe("getSource", () => {
  it("should return an instance of test", () => {
    const result = getSource({"source": "test"});

    result.should.be.an("object");
    result.read.should.be.a("function");
  });

  it("should return an instance of cron", () => {
    const result = getSource({"source": "cron", "cronExpression": "* * * * * *"});

    result.should.be.an("object");
    result.read.should.be.a("function");

    result.stop();
  });

  it("should return an instance of aws", () => {
    const result = getSource({"source": "aws"});

    result.should.be.an("object");
    result.read.should.be.a("function");
  });

  it("should return the object already in config.source", () => {
    const fakeSource = {"foo": "bar"};
    const result = getSource({"source": fakeSource});

    result.should.equal(fakeSource);
  });
});
