const logger = require("./logger")("serviceHost.throttle");


function throttle(readStream, messageDelegator, config) {

  let inProgress = 0;

  function callAsync(message) {

    function checkConcurrency() {
      if (inProgress >= config.maxProcessingConcurrency) {
        readStream.pause();
        logger.debug(`${message.correlationId} - processing:${inProgress} pausing`);
      } else {
        readStream.resume();
        logger.debug(`${message.correlationId} - processing:${inProgress} resumed`);
      }
    }

    function asyncDone() {
      readStream.resume();
      inProgress--;
      logger.debug(`${message.correlationId} - processing:${inProgress} asyncDone`);
    }

    if (message.isControlMessage) {
      if (message.payload.error) {
        logger.error(message.correlationId, message.eventName, message.payload);
        // TODO incremental backoff when consecutive errors occur
        setTimeout(checkConcurrency, config.millisecondsToWaitOnError);
      } else {
        logger.info(message.correlationId, message.eventName, message.payload);
        setTimeout(checkConcurrency, config.millisecondsToWaitOnNoMessages);
      }
      readStream.pause();
      return;
    }

    messageDelegator(message).then(asyncDone);
    inProgress++;

    checkConcurrency();
  }

  readStream.on("data", message => {
    logger.trace("got data:", message);
    callAsync(message);
  });

  readStream.on("end", () => {
    logger.warn("end reached!");
  });
}


module.exports = throttle;
