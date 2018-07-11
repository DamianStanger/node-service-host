const source = require("./source/testSource");
const throttle = require("./throttle");


function serviceHost() {

  const eventNameToHandlerMap = new Map();

  function register(handler, eventName, version) {

    let eventVersions = eventNameToHandlerMap.get(eventName);
    if (eventVersions) {
      const versionHandler = eventVersions.get(version);

      if (versionHandler) {
        throw new Error(`A handler already exists for the event ${eventName} version ${version}`);
      }

      eventVersions.set(version, handler);

    } else {
      eventVersions = new Map();
      eventVersions.set(version, handler);
      eventNameToHandlerMap.set(eventName, eventVersions);
    }
  }

  function start() {
    const maxConcurrency = 2;
    throttle(source, eventNameToHandlerMap, maxConcurrency);
  }

  return {register, start};
}


module.exports = serviceHost;
