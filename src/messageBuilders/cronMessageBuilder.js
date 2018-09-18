const messageBuilder = require("./messageBuilder");


function cronMessageBuilder() {
  let eventName;

  return {
    "withEventName"(theName) {
      eventName = theName;
      return this;
    },

    "build"() {
      const payload = {
        "timestamp": new Date()
      };
      const cronMessage = messageBuilder().withEventName(eventName).withPayload(payload).build();
      cronMessage.isCron = true;
      return cronMessage;
    }
  };
}


module.exports = cronMessageBuilder;
