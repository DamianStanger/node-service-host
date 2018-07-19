const logger = require("./logger")("serviceHost.throttle");


function throttle(readStream, messageDelegator, maxConcurrency) {

  let inProgress = 0;

  function callAsync(message) {

    function checkConcurrency() {
      if (inProgress >= maxConcurrency) {
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
