/* eslint-disable no-undefined */


function messageDelegator(readStream) {

  const eventHandlerMap = new Map();

  function registerHandler(handler, eventName, version) {

    let eventVersions = eventHandlerMap.get(eventName);
    if (eventVersions) {
      const versionHandler = eventVersions.get(version);

      if (versionHandler) {
        throw new Error(`A handler already exists for the event ${eventName} version ${version}`);
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
      return readStream.success(message);
    }

    return versionHandler(message, readStream.success, readStream.retry, readStream.fail).catch(() => {
      readStream.fail(message);
    });
  }

  return {registerHandler, process};
}


module.exports = messageDelegator;
