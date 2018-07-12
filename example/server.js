/* eslint-disable no-console,no-unused-vars */

const config = {
  "readHighWaterMark": 2,
  "maxConcurrency": 2,
  "source": "testSource"
};
const serviceHost = require("../src/serviceHost")(config);


function orderPlacedHandler(message, success, retry, fail) {
  console.log("server - orderPlacedHandler processing message", message);

  function wait(milliSeconds) {
    return new Promise(resolve => setTimeout(resolve, milliSeconds));
  }

  return wait(2000).then(() => success(message)).catch(() => fail(message));
}

const eventName = "orderPlaced";
const versionNumber = 1;

serviceHost.register(orderPlacedHandler, eventName, versionNumber);
serviceHost.start();
