/* eslint-disable no-console,no-unused-vars */

const serviceHost = require("../src/serviceHost")();


function handlerFunction(message, success, retry, fail) {
  console.log("server - Processing message", message);
  return Promise.resolve().then(() => {

    // Do work here

    success(message);
  }).catch(err => {
    console.log("server - caught error", err)
    fail(message);
  });
}

const eventName = "orderPlaced";
const versionNumber = 1;

serviceHost.register(handlerFunction, eventName, versionNumber);
serviceHost.start();
