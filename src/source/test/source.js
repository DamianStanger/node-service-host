const logger = require("../../logger")("serviceHost.source.test.source");
const messageBuilder = require("../../messageBuilders/messageBuilder");
const readStream = require("../readStream");
const wait = require("../../utils/wait");


function getSource(configuration) {
  logger.debug("getSource", configuration);

  const unstructuredMessage = {
    "myName": "foo",
    "requestId": "1000000002",
    "data": {
      "id": 123456,
      "stuff": "unstructured messages like this do exist !"
    }
  };

  function getMessageContainer(message) {
    return {
      "Body": JSON.stringify(message),
      "ReceiptHandle": `testSourceReceiptHandle:${message.correlationId}`,
      "Attributes": {
        "SentTimestamp": Math.floor(new Date()),
        "ApproximateReceiveCount": 1,
        "SenderId": "ABCDEFG:Damo@example.com",
        "ApproximateFirstReceiveTimestamp": Math.floor(new Date())
      }
    };
  }

  function getTestMessages() {
    return [
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload("eyJkYXRhIjoiZml6ekJ1enoifQ==").build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload("ewogICAgImEiOiAiYiIsCiAgICAiYyI6IHsKICAgICAgImQiOiAxMC41CiAgICB9CiAgfQ==").build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload({"foo2": "bar2"}).build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload("").build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload({"simulateFailure": "someFatalNonRecoverableErrorOccured"}).build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload({"simulateFailure": "someRecoverableError-shouldRetry"}).build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").build(),
      messageBuilder().withEventName("orderPlaced").withPayload("unstructured text payload").build(),
      messageBuilder().withPayload("").build(),
      messageBuilder().build(),
      null,
      messageBuilder().withCorrelationId(null).build(),
      null,
      null,
      messageBuilder().withVersion(2).withEventName("orderPlaced").withPayload("").build(),
      messageBuilder().withEventName("orderReceived").build(),
      unstructuredMessage
    ];
  }


  const messages = getTestMessages();

  function receiveMessage() {
    const data = {"Messages": []};

    const thisMessage = messages.shift();
    if (thisMessage) {
      logger.info(`${thisMessage.correlationId} - READ event:${thisMessage.eventName} version:${thisMessage.version}`);
      data.Messages.push(getMessageContainer(thisMessage));
    } else {
      logger.info("READ message stream empty!");
    }

    return wait(500).then(() => data);
  }

  function ignore(message) {
    const deleteData = `ignoreData:${message.ReceiptHandle}`;

    return wait(500).then(() => deleteData);
  }

  function success(message) {
    const deleteData = `successData:${message.ReceiptHandle}`;

    return wait(500).then(() => deleteData);
  }

  function retry() {
    return Promise.resolve();
  }

  function fail() {
    return Promise.resolve();
  }

  const source = {receiveMessage, ignore, success, retry, fail};
  return readStream(configuration, source);
}


module.exports = getSource;
