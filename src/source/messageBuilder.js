const uuid = require("uuid/v4");

const controlMessageEventName = "serviceHost.messages.flowControl";


function messageBuilder() {
  let eventName;
  let version;
  let payload;
  let correlationId = uuid();
  let attributes = {};

  function isControlMessage() {
    return eventName === controlMessageEventName;
  }
  function buildMessage() {
    return {eventName, version, payload, correlationId, "isControlMessage": isControlMessage(), attributes};
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

    "buildControlMessage"() {
      eventName = controlMessageEventName;
      correlationId = "00000000-0000-0000-0000-000000000000";
      if (!payload) {
        payload = {};
      }
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
