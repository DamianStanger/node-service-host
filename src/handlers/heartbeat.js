const logger = require("../logger")("serviceHost.handlers.heartbeat");


function getHeartbeatHandler(config) {
  // eslint-disable-next-line no-unused-vars
  function heartbeatHandler(message, success, retry, fail) {
    logger.info(message.correlationId, `Handling heartbeat sent at ${message.payload.timestamp.toISOString()}`);
    return config.destination.execute(message).then(() => success(message));
  }

  return heartbeatHandler;
}


module.exports = getHeartbeatHandler;
