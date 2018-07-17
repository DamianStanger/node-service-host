const throttle = require("./throttle");
const getConfiguration = require("./configuration");
const logger = require("./logger")("serviceHost");


function serviceHost(config) {
  logger.debug("Creating serviceHost");

  const configuration = getConfiguration(config);
  const messageDelegator = require("./messageDelegator")(configuration.source);

  function register(handler, eventName, version) {
    logger.debug(`Registering event:${eventName} version:${version}`);

    try {
      messageDelegator.registerHandler(handler, eventName, version);
    } catch (err) {
      logger.fatal(err);
      throw err;
    }
  }

  function start() {
    logger.debug("starting serviceHost");
    throttle(configuration.source, messageDelegator.process, configuration.maxConcurrency);
  }

  logger.debug("Returning serviceHost");
  return {register, start};
}


module.exports = serviceHost;
