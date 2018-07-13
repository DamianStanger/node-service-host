const throttle = require("./throttle");
const getConfiguration = require("./configuration");


function serviceHost(config) {

  const configuration = getConfiguration(config);
  const messageDelegator = require("./messageDelegator")(configuration.source);

  function register(handler, eventName, version) {
    messageDelegator.registerHandler(handler, eventName, version);
  }

  function start() {
    throttle(configuration.source, messageDelegator.process, configuration.maxConcurrency);
  }

  return {register, start};
}


module.exports = serviceHost;
