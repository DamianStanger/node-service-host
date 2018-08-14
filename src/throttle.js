const logger = require("./logger")("serviceHost.throttle");
const wait = require("./utils/wait");


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
      readStream.pause();
      if (message.payload.error) {
        logger.error(message.correlationId, message.eventName, message.payload);
        return wait(config.millisecondsToWaitOnError).then(checkConcurrency);
      }
      logger.info(message.correlationId, message.eventName, message.payload);
      return wait(config.millisecondsToWaitOnNoMessages).then(checkConcurrency);
    }

    messageDelegator(message).then(asyncDone);
    inProgress++;

    checkConcurrency();
    return Promise.resolve();
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
