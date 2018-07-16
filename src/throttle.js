const logger = require("./logger")("serviceHost.throttle");


function throttle(readStream, messageDelegator, maxConcurrency) {

  let inProgress = 0;

  function checkConcurrency() {
    if (inProgress >= maxConcurrency) {
      readStream.pause();
      logger.debug(`${inProgress} Write pausing`);
    } else {
      readStream.resume();
      logger.debug(`${inProgress} Write resumed`);
    }
  }

  function callAsync(message) {

    function asyncDone() {
      readStream.resume();
      inProgress--;
      logger.debug(`${message.correlationId} - ${inProgress} Write finished`);
    }

    messageDelegator(message).then(asyncDone);
    inProgress++;

    checkConcurrency();
  }

  readStream.on("data", message => {
    callAsync(message);
  });

  readStream.on("end", () => {
    logger.warn("throttle - end reached!");
  });
}


module.exports = throttle;
