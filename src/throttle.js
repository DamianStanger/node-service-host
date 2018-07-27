const logger = require("./logger")("serviceHost.throttle");


function throttle(readStream, messageDelegator, config) {

  let inProgress = 0;

  function callAsync(message) {

    function checkConcurrency() {
      if (inProgress >= config.maxConcurrency) {
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
      logger.debug(message.correlationId, message.eventName, message.payload);
      if (message.payload.error) {
        setTimeout(checkConcurrency, config.millisecondsToWaitOnError);
      } else {
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
