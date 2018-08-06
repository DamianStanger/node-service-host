const Readable = require("stream").Readable;
const logger = require("../logger")("serviceHost.readStream");
const messageBuilder = require("./messageBuilder");


function getReadStream(configuration, source) {

  function deleteMessage(message, resolve, reject) {
    source.deleteMessage(message, (err, data) => {
      if (err) {
        logger.error(message.correlationId, "Error deleting msg");
        logger.error(err);
        reject(err);
      } else {
        logger.debug("Message deleted", data);
        resolve(message);
      }
    });
  }


  let receiveInProgress = false;

  function receiveMessageBatch(readStream) {
    if (receiveInProgress) {
      logger.debug("receive is in progress, skipping read this time");
    } else {
      logger.debug("set receiveInProgress = true");
      receiveInProgress = true;
      source.receiveMessage((err, data) => {
        if (err) {

          // TODO Should this have a back off mechanisum for repeat failures? (maybe in the throttle)
          receiveInProgress = false;
          const payload = {
            "reason": "receiveMessageBatch got an error from the source",
            "error": err
          };
          logger.error(payload.reason, JSON.stringify(payload.error));
          const controlMessage = messageBuilder().withPayload(payload).buildControlMessage();
          readStream.push(controlMessage);

        } else if (data && data.Messages && data.Messages.length > 0) {

          logger.debug(`receiveMessageBatch got ${data.Messages.length} message(s)`);
          data.Messages.forEach((msg, i) => {
            logger.trace("receiveMessageBatch received and processing", msg);
            const message = JSON.parse(msg.Body);
            logger.debug(message.correlationId, "receiveMessageBatch received and processing message");
            message.ReceiptHandle = msg.ReceiptHandle;
            message.attributes = msg.attributes;
            receiveInProgress = data.Messages.length > i + 1;
            readStream.push(message);
            logger.debug(message.correlationId, "pushed");
          });

        } else {

          receiveInProgress = false;
          const payload = {
            "reason": "receiveMessageBatch got no results from aws, sorry!"
          };
          logger.debug(payload.reason);
          const controlMessage = messageBuilder().withPayload(payload).buildControlMessage();
          readStream.push(controlMessage);

        }
      });
    }
  }

  const readStream = new Readable({
    "objectMode": true,
    "highWaterMark": configuration.readHighWaterMark,

    read() {
      logger.debug("read called");
      receiveMessageBatch(this);
    }
  });

  readStream.success = message => {
    logger.debug(message.correlationId, "success");
    return new Promise((resolve, reject) => {
      deleteMessage(message, resolve, reject);
    });
  };

  readStream.retry = (message, error) => {
    logger.error(message.correlationId, "retry");
    logger.error(error);
  };

  readStream.fail = (message, error) => {
    logger.error(message.correlationId, "fail");
    logger.error(error);
  };

  readStream.ignore = message => {
    logger.debug(message.correlationId, "ignore");
    return new Promise((resolve, reject) => {
      deleteMessage(message, resolve, reject);
    });
  };

  return readStream;
}


module.exports = getReadStream;
