const chai = require("chai");
const expect = chai.expect;
chai.should();

const messageBuilder = require("../../../src/source/messageBuilder");


describe("messageBuilder", () => {
  it("should build a failure message based upon a copy of the original message and error", () => {
    const originalMessage = {"foo": {"bar": 1}};
    const error = new Error("FOOBAR");

    const failureMessage = messageBuilder().buildFailureMessage(error, originalMessage);

    failureMessage.foo.should.deep.equal(originalMessage.foo);
    failureMessage.error.message.should.equal(error.message);
    failureMessage.error.stack.should.equal(error.stack);

    originalMessage.foo.bar = 2;
    error.message = "shouldNotChange";

    failureMessage.foo.bar.should.equal(1);
    failureMessage.error.message.should.equal("FOOBAR");
  });

  it("should build a default message", () => {
    const message = messageBuilder().build();

    message.attributes.should.deep.equal({});
    message.correlationId.should.match(/[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}/);
    expect(message.eventName).to.be.undefined;
    expect(message.payload).to.be.undefined;
    expect(message.version).to.be.undefined;
  });

  it("should build a default control message", () => {
    const message = messageBuilder().buildControlMessage();

    message.attributes.should.deep.equal({});
    message.correlationId.should.equal("00000000-0000-0000-0000-000000000000");
    message.eventName.should.equal("serviceHost.messages.flowControl");
    message.payload.should.deep.equal({});
    expect(message.version).to.be.undefined;
  });

  it("should use passed values when building a message", () => {
    const message = messageBuilder()
      .withAttributes("ATTRIBUTE")
      .withCorrelationId("CORRELATION")
      .withEventName("EVENT")
      .withPayload("PAY")
      .withVersion("VERSION")
      .build();

    message.attributes.should.equal("ATTRIBUTE");
    message.correlationId.should.equal("CORRELATION");
    message.eventName.should.equal("EVENT");
    message.payload.should.equal("PAY");
    message.version.should.equal("VERSION");
  });

  it("should use passed values when building a control message", () => {
    const message = messageBuilder()
      .withAttributes("ATTRIBUTE")
      .withCorrelationId("CORRELATION")
      .withEventName("EVENT")
      .withPayload("PAY")
      .withVersion("VERSION")
      .buildControlMessage();

    message.attributes.should.equal("ATTRIBUTE");
    message.correlationId.should.equal("00000000-0000-0000-0000-000000000000");
    message.eventName.should.equal("serviceHost.messages.flowControl");
    message.payload.should.equal("PAY");
    message.version.should.equal("VERSION");
  });


  describe("isControlMessage", () => {
    it("should be true for control messages", () => {
      const message = messageBuilder().buildControlMessage();
      message.isControlMessage.should.be.true;
    });
    it("should be false for none control messages", () => {
      const message = messageBuilder().build();
      message.isControlMessage.should.be.false;
    });
  });


});
