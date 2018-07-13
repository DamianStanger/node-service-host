const throttle = require("./throttle");
const getConfiguration = require("./configuration");
const logger = require("./logger")("serviceHost");


function serviceHost(config) {

  const configuration = getConfiguration(config);
  const messageDelegator = require("./messageDelegator")(configuration.source);

  function register(handler, eventName, version) {
    try {
      messageDelegator.registerHandler(handler, eventName, version);
    } catch (err) {
      logger.fatal(err);
      throw err;
    }
  }

  function start() {
    throttle(configuration.source, messageDelegator.process, configuration.maxConcurrency);
  }

  return {register, start};
}


module.exports = serviceHost;
