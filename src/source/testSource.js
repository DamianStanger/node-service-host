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
    messageBuilder().withPayload({"simulateFailure": "Hardcoded error in the test data"}).build(),
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
        logger.info(`${thisMessage.correlationId} - READ event:${thisMessage.eventName} version:${thisMessage.version}`);
        this.push(thisMessage);
      } else {
        logger.warn("READ message stream empty!");
        this.push(null);
      }
    }
  });

  testSource.success = message => {
    const resolutionMsg = `${message.correlationId} - success`;
    logger.info(resolutionMsg);
    return Promise.resolve(resolutionMsg);
  };

  testSource.retry = message => {
    const resolutionMsg = `${message.correlationId} - retry`;
    logger.warn(resolutionMsg);
    return Promise.resolve(resolutionMsg);
  };

  testSource.fail = (message, error) => {
    const resolutionMsg = `${message.correlationId} - fail`;
    logger.error(resolutionMsg, error);
    return Promise.resolve(resolutionMsg);
  };

  testSource.ignore = message => {
    const resolutionMsg = `${message.correlationId} - ignore`;
    logger.info(resolutionMsg);
    return Promise.resolve(resolutionMsg);
  };

  return testSource;
}

module.exports = getSource;
