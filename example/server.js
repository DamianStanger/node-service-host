const config = {
  "readHighWaterMark": 2,
  "maxConcurrency": 2,
  "source": "testSource"
};
const serviceHost = require("../src/serviceHost")(config);
const logger = require("../src/logger")("example.server", "info");


function orderPlacedHandler(message, success, retry, fail) {
  logger.info("server - orderPlacedHandler processing message", message);

  function wait(milliSeconds) {
    return new Promise(resolve => setTimeout(resolve, milliSeconds));
  }

  return wait(2000).then(() => {
    // do some work with the message
    success(message);
  }).catch(err => {
    const someFatalNonRecoverableErrorOccured = false;
    if (someFatalNonRecoverableErrorOccured) {
      fail(message, err);
    } else {
      retry(message);
    }
  });
}


const eventName = "orderPlaced";
const versionNumber = 1;

serviceHost.register(orderPlacedHandler, eventName, versionNumber);
serviceHost.start();
