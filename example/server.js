/* eslint-disable no-console,no-unused-vars */

const serviceHost = require("../src/serviceHost")();


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
