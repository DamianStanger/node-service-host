const throttle = require("./throttle");
const getConfiguration = require("./configuration");
const logger = require("./logger")("serviceHost");
const decodeTransformer = require("./decodeTransformer");
const getMessageDelegator = require("./messageDelegator");
const getHeartbeatHandler = require("./handlers/heartbeat");


function serviceHost(config) {
  logger.debug("Creating serviceHost");

  const configuration = getConfiguration(config);
  const messageDelegator = getMessageDelegator(configuration.source);

  function register(handler, eventName, version) {
    logger.debug(`Registering event:${eventName} version:${version}`);
    messageDelegator.registerHandler(handler, eventName, version);
  }

  function start() {
    logger.debug("Starting serviceHost");
    const pipe = configuration.source.pipe(decodeTransformer());
    throttle(pipe, messageDelegator.process, configuration);

    logger.debug("Creating and starting the heartbeat");
    const heartbeatMessageDelegator = getMessageDelegator(configuration.heartbeat.source);
    const heartbeatHandler = getHeartbeatHandler(configuration.heartbeat);
    heartbeatMessageDelegator.registerHandler(heartbeatHandler, configuration.heartbeat.cronEventName);
    throttle(configuration.heartbeat.source, heartbeatMessageDelegator.process, configuration.heartbeat);
  }

  logger.debug("Returning serviceHost");
  return {register, start};
}


module.exports = serviceHost;
