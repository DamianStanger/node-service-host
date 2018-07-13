/* eslint-disable no-undefined */
const {Readable} = require("stream");
const logger = require("../logger")("serviceHost.testSource");


let index = 0;

function messageBuilder() {
  let eventName = "orderPlaced";
  let version = 1;
  let payload = "";
  let correlationId = `00000000-0000-0000-0000-00000000000${index++}`;

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
    "build"() {
      return {eventName, version, payload, correlationId};
    }
  };
}

const unstructuredMessage = {
  "myName": "foo",
  "requestId": "1000000002",
  "data": {
    "id": 123456,
    "stuff": "unstructured messages like this do exist !"
  }
};

function getTestMessages() {
  return [
    messageBuilder().build(),
    messageBuilder().withVersion(undefined).build(),
    messageBuilder().withVersion(undefined).withEventName(undefined).build(),
    messageBuilder().withVersion(undefined).withEventName(undefined).withPayload(undefined).build(),
    messageBuilder().withVersion(undefined).withEventName(undefined).withPayload(undefined).withCorrelationId(undefined).build(),
    messageBuilder().withPayload("eyJkYXRhIjoiZm9iYXIifQ==").build(),
    messageBuilder().withVersion(2).build(),
    messageBuilder().withEventName("orderReceived").build(),
    unstructuredMessage,
    messageBuilder().withPayload("eyJkYXRhIjoiZml6ekJ1enoifQ==").build()
  ];
}


const messages = getTestMessages();

function getSource(configuration) {
  const testSource = new Readable({
    "objectMode": true,
    "highWaterMark": configuration.readHighWaterMark,

    read() {
      const thisMessage = messages.shift();
      if (thisMessage) {
        logger.info(`testSource - READ ${thisMessage.correlationId}`);
        this.push(thisMessage);
      } else {
        logger.warn("testSource - READ End");
        this.push(null);
      }
    }
  });

  testSource.success = message => {
    logger.info(`success ${message.correlationId}`);
    return Promise.resolve();
  };

  testSource.retry = message => {
    logger.warn(`retry ${message.correlationId}`);
    return Promise.resolve();
  };

  testSource.fail = (message, error) => {
    logger.error(`fail ${message.correlationId}`, error);
    return Promise.resolve();
  };

  return testSource;
}

module.exports = getSource;
