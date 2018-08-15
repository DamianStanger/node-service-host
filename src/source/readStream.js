const Readable = require("stream").Readable;
const logger = require("../logger")("serviceHost.readStream");
const messageBuilder = require("./messageBuilder");


function getReadStream(configuration, source) {

  let receiveInProgress = false;

  function receiveMessageBatch(readStream) {
    if (receiveInProgress) {
      logger.debug("receive is in progress, skipping read this time");
    } else {
      logger.debug("set receiveInProgress = true");
      receiveInProgress = true;
      source.receiveMessage().then(data => {
        if (data && data.Messages && data.Messages.length > 0) {

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
          logger.trace(`receiveMessageBatch finished processing all ${data.Messages.length} messages`);

        } else {

          receiveInProgress = false;
          const payload = {
            "reason": "receiveMessageBatch got no results from aws, sorry!"
          };
          logger.debug(payload.reason);
          const controlMessage = messageBuilder().withPayload(payload).buildControlMessage();
          readStream.push(controlMessage);

        }
      }).catch(err => {
        // TODO Should this have a back off mechanisum for repeat failures? (maybe in the throttle)
        receiveInProgress = false;
        const payload = {
          "reason": "receiveMessageBatch got an error from the source",
          "error": err
        };
        logger.error(payload.reason);
        logger.error(err);
        const controlMessage = messageBuilder().withPayload(payload).buildControlMessage();
        readStream.push(controlMessage);
      });
    }
  }

  const readStream = new Readable({
    "objectMode": true,
    "highWaterMark": 1,

    read() {
      logger.debug("read called");
      receiveMessageBatch(this);
    }
  });

  readStream.success = message => {
    logger.debug(message.correlationId, "success");
    return source.success(message);
  };

  readStream.retry = (message, error) => {
    logger.error(message.correlationId, "retry");
    logger.error(error);
    return source.retry(message);
  };

  readStream.fail = (message, error) => {
    logger.error(message.correlationId, "fail");
    logger.error(error);
    return source.fail(message);
  };

  readStream.ignore = message => {
    logger.debug(message.correlationId, "ignore");
    return source.ignore(message);
  };

  return readStream;
}


module.exports = getReadStream;
