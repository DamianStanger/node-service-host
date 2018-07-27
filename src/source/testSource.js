/* eslint-disable no-undefined */
const {Readable} = require("stream");
const logger = require("../logger")("serviceHost.testSource");
const messageBuilder = require("./messageBuilder");


const unstructuredMessage = {
  "myName": "foo",
  "requestId": "1000000002",
  "data": {
    "id": 123456,
    "stuff": "unstructured messages like this do exist !"
  }
};

function getTestMessages() {
  const attributes = {"SentTimestamp": "1532638517885"};
  return [
    messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload("eyJkYXRhIjoiZml6ekJ1enoifQ==").withAttributes(attributes).build(),
    messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload({"foo2": "bar2"}).build(),
    messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload("").build(),
    messageBuilder().withVersion(1).withEventName("orderPlaced").build(),
    messageBuilder().withEventName("orderPlaced").withPayload("unstructured text payload").build(),
    messageBuilder().withPayload("").build(),
    messageBuilder().build(),
    messageBuilder().buildControlMessage("no results001"),
    messageBuilder().withCorrelationId(undefined).build(),
    messageBuilder().buildControlMessage("no results002"),
    messageBuilder().buildControlMessage("no results003"),
    messageBuilder().withVersion(2).withEventName("orderPlaced").withPayload("").build(),
    messageBuilder().withEventName("orderReceived").build(),
    unstructuredMessage,
    messageBuilder().withPayload({"reason": "no messages received"}).buildControlMessage()
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
        const controlMessage = messageBuilder().withPayload({"reason": "no messages received"}).buildControlMessage();
        this.push(controlMessage);
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
