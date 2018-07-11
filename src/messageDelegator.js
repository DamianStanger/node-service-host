/* eslint-disable no-undefined */


function messageDelegator(readStream, eventHandlerMap) {

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

  return process;
}


module.exports = messageDelegator;
