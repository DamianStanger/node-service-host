const chai = require("chai");
const expect = chai.expect;
chai.should();

const controlMessageBuilder = require("../../../src/messageBuilders/controlMessageBuilder");


describe("controlMessageBuilder", () => {

  it("should build a default control message", () => {
    const message = controlMessageBuilder().build();

    message.attributes.should.deep.equal({});
    message.correlationId.should.equal("00000000-0000-0000-0000-000000000000");
    message.eventName.should.equal("serviceHost.messages.flowControl");
    message.payload.should.deep.equal({});
    expect(message.version).to.be.undefined;
  });

  it("should use passed values when building a control message", () => {
    const message = controlMessageBuilder()
      .withPayload("PAY")
      .build();

    message.payload.should.equal("PAY");
  });


  describe("isControlMessage", () => {
    it("should be true for control messages", () => {
      const message = controlMessageBuilder().build();
      message.isControlMessage.should.be.true;
    });
  });
});
