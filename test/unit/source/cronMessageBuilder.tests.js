const chai = require("chai");
const expect = chai.expect;
chai.should();

const cronMessageBuilder = require("../../../src/source/cronMessageBuilder");


describe("cronMessageBuilder", () => {
  it("should build a default message", () => {
    const message = cronMessageBuilder().build();

    message.attributes.should.deep.equal({});
    message.correlationId.should.match(/[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}/);
    expect(message.eventName).to.be.undefined;
    expect(message.version).to.be.undefined;
    expect(message.isCron).to.be.true;
    expect(message.payload.timestamp).to.be.instanceOf(Date);
  });

  it("should use passed values when building a message", () => {
    const message = cronMessageBuilder()
      .withEventName("EVENT")
      .build();

    message.eventName.should.equal("EVENT");
  });
});
