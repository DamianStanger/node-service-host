// const logger = require("../logger")("serviceHost.destination.logging");


function getLoggingDestination() {
  const loggingDestination = {
    "execute"() {
      return Promise.resolve(() => {});
    }
  };
  return loggingDestination;
}


module.exports = getLoggingDestination;
