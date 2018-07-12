const throttle = require("./throttle");
const getConfiguration = require("./configuration");


function serviceHost(config) {

  const configuration = getConfiguration(config);
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
    throttle(configuration.source, eventNameToHandlerMap, configuration.maxConcurrency);
  }

  return {register, start};
}


module.exports = serviceHost;
