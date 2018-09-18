const logger = require("../logger")("serviceHost.handlers.heartbeat");


// eslint-disable-next-line no-unused-vars
function getHeartbeatHandler(config) {
  // eslint-disable-next-line no-unused-vars
  function heartbeatHandler(message, success, retry, fail) {
    logger.info(message.correlationId, `Handling heartbeat sent at ${message.payload.timestamp.toISOString()}`);
    return success(message);
  }

  return heartbeatHandler;
}


module.exports = getHeartbeatHandler;
