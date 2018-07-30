const {Readable} = require("stream");
const logger = require("../logger")("serviceHost.testSource");
const messageBuilder = require("./messageBuilder");


function getSource(configuration) {
  logger.debug("getSource", configuration);

  function mockDeleteMessage(deleteParams, callback) {
    let deleteError;
    const deleteData = `deletedTheMessage:${deleteParams.ReceiptHandle}`;

    setTimeout(() => {
      callback(deleteError, deleteData);
    }, 1000);
  }

  function deleteMessage(message, resolve, reject) {
    const deleteParams = {
      "QueueUrl": configuration.queueUrl,
      "ReceiptHandle": message.ReceiptHandle
    };

    logger.trace("deleteMessage:", message);
    logger.trace("deleteParams:", deleteParams);

    mockDeleteMessage(deleteParams, function (err, data) {
      if (err) {
        logger.error("Error deleting msg", err);
        reject(err);
      } else {
        logger.debug("Message deleted", data);
        resolve(`${message.correlationId} - ignore`);
      }
    });
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
    const attributes = {"SentTimestamp": "1532638517885"};
    return [
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload("eyJkYXRhIjoiZml6ekJ1enoifQ==").withAttributes(attributes).build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload({"foo2": "bar2"}).build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").withPayload("").build(),
      messageBuilder().withVersion(1).withEventName("orderPlaced").build(),
      messageBuilder().withEventName("orderPlaced").withPayload("unstructured text payload").build(),
      messageBuilder().withPayload("").build(),
      messageBuilder().build(),
      messageBuilder().withPayload({"reason": "no messages received"}).buildControlMessage("no results001"),
      messageBuilder().withCorrelationId(null).build(),
      messageBuilder().withPayload({"reason": "no messages received"}).buildControlMessage("no results002"),
      messageBuilder().withPayload({"reason": "no messages received"}).buildControlMessage("no results003"),
      messageBuilder().withVersion(2).withEventName("orderPlaced").withPayload("").build(),
      messageBuilder().withEventName("orderReceived").build(),
      unstructuredMessage
    ];
  }


  const messages = getTestMessages();

  function receiveMessageBatch(readStream) {
    const thisMessage = messages.shift();
    if (thisMessage) {
      logger.info(`${thisMessage.correlationId} - READ event:${thisMessage.eventName} version:${thisMessage.version}`);
      readStream.push(thisMessage);
    } else {
      logger.warn("READ message stream empty!");
      const controlMessage = messageBuilder().withPayload({"reason": "no messages received"}).buildControlMessage();
      readStream.push(controlMessage);
    }
  }

  const source = new Readable({
    "objectMode": true,
    "highWaterMark": configuration.readHighWaterMark,

    read() {
      logger.debug("read");
      receiveMessageBatch(this);
    }
  });

  source.success = message => {
    const resolutionMsg = `${message.correlationId} - success`;
    logger.info(resolutionMsg);
    return Promise.resolve(resolutionMsg);
  };

  source.retry = message => {
    const resolutionMsg = `${message.correlationId} - retry`;
    logger.warn(resolutionMsg);
    return Promise.resolve(resolutionMsg);
  };

  source.fail = (message, error) => {
    const resolutionMsg = `${message.correlationId} - fail`;
    logger.error(resolutionMsg, error);
    return Promise.resolve(resolutionMsg);
  };

  source.ignore = message => {
    logger.debug(message.correlationId, "ignore");
    return new Promise((resolve, reject) => {
      return deleteMessage(message, resolve, reject);
    });
  };

  return source;
}


module.exports = getSource;
