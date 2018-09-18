const messageBuilder = require("./messageBuilder");

const controlMessageEventName = "serviceHost.messages.flowControl";


function controlMessageBuilder() {
  let payload = {};

  return {
    "withPayload"(thePayload) {
      payload = thePayload;
      return this;
    },

    "build"() {
      const controlMessage = messageBuilder()
        .withPayload(payload)
        .withEventName(controlMessageEventName)
        .withCorrelationId("00000000-0000-0000-0000-000000000000")
        .build();

      controlMessage.isControlMessage = true;

      return controlMessage;
    }
  };
}


module.exports = controlMessageBuilder;
