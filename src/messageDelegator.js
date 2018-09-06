/* eslint-disable no-undefined */

const logger = require("./logger")("serviceHost.messageDelegator");


function messageDelegator(readStream) {

  const eventHandlerMap = new Map();

  function registerHandler(handler, eventName, version) {
    logger.debug(`Assigning handler to event:${eventName} version:${version}`);

    let eventVersions = eventHandlerMap.get(eventName);
    if (eventVersions) {
      const versionHandler = eventVersions.get(version);

      if (versionHandler) {
        const errorTxt = `A handler already exists for the event:${eventName} version:${version}`;
        logger.fatal(errorTxt);
        throw new Error(errorTxt);
      }

      eventVersions.set(version, handler);

    } else {
      eventVersions = new Map();
      eventVersions.set(version, handler);
      eventHandlerMap.set(eventName, eventVersions);
    }
  }

  function process(message) {

    let versionHandler;
    const eventVersions = eventHandlerMap.get(message.eventName);
    if (eventVersions) {
      versionHandler = eventVersions.get(message.version);
      if (!versionHandler) {
        versionHandler = eventVersions.get(undefined);
      }
    }

    if (!versionHandler) {
      logger.debug(`${message.correlationId} - Ignoring message with event:${message.eventName} version:${message.version}`);
      return readStream.ignore(message);
    }

    return versionHandler(message, readStream.success, readStream.retry, readStream.fail).catch(err => {
      logger.error(`${message.correlationId} - Caught error ${err}`);
      logger.error(err);
      return readStream.retry(message);
    });
  }

  return {registerHandler, process};
}


module.exports = messageDelegator;
