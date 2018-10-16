const logger = require("../logger")("serviceHost.destination.logging");


function getLoggingDestination() {

  logger.debug("creating logging destination");

  const loggingDestination = {
    "execute"(message, subject) {
      logger.info(message.correlationId, subject);
      return Promise.resolve();
    }
  };
  return loggingDestination;
}


module.exports = getLoggingDestination;
