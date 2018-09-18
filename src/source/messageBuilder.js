const uuid = require("uuid/v4");


function messageBuilder() {
  let eventName;
  let version;
  let payload;
  let correlationId = uuid();
  let attributes = {};

  function buildMessage() {
    return {eventName, version, payload, correlationId, attributes};
  }

  return {
    "withEventName"(theName) {
      eventName = theName;
      return this;
    },

    "withVersion"(theVersion) {
      version = theVersion;
      return this;
    },

    "withPayload"(thePayload) {
      payload = thePayload;
      return this;
    },

    "withCorrelationId"(theCorrelationId) {
      correlationId = theCorrelationId;
      return this;
    },

    "withAttributes"(attributesObj) {
      attributes = attributesObj;
      return this;
    },

    "build"() {
      return buildMessage();
    },

    "buildFailureMessage"(error, originalMessage) {
      const failureMessage = JSON.parse(JSON.stringify(originalMessage));
      failureMessage.error = JSON.parse(JSON.stringify(error, Reflect.ownKeys(error)));
      return failureMessage;
    }
  };
}


module.exports = messageBuilder;
