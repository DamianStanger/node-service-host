const logger = require("../logger")("serviceHost.handlers.heartbeat");


function getHeartbeatHandler(config) {

  function heartbeatHandler(message, success, retry, fail) {
    logger.info(message.correlationId, `Handling ${message.eventName} sent at ${message.payload.timestamp.toISOString()}`);

    const subject = `${message.eventName}|${message.payload.timestamp.toISOString()}|${message.correlationId}`;
    return config.destination.execute(message, subject)
      .then(() => success(message))
      .catch(err => {
        logger.error(message.correlationId, `failure handling ${message.eventName}`, err);
        fail(err, message);
      });
  }

  return heartbeatHandler;
}


module.exports = getHeartbeatHandler;
