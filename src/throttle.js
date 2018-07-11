/* eslint-disable no-console */


function throttle(readStream, eventHandlerMap, maxConcurrency) {

  const messageDelegator = require("./messageDelegator")(readStream, eventHandlerMap);

  let inProgress = 0;
  let total = 0;

  function checkConcurrency() {
    if (inProgress >= maxConcurrency) {
      readStream.pause();
      console.log(`throttle - ${inProgress}:${total} Write pausing`);
    } else {
      readStream.resume();
      console.log(`throttle - ${inProgress}:${total} Write resumed`);
    }
  }

  function callAsync(message) {

    function asyncDone() {
      readStream.resume();
      inProgress--;
      total++;
      console.log(`throttle - ${message.correlationId} - ${inProgress}:${total} Write finished`);
    }

    messageDelegator(message).then(asyncDone);
    inProgress++;

    checkConcurrency();
  }

  readStream.on("data", message => {
    callAsync(message);
  });

  readStream.on("end", () => {
    console.log("throttle - WRITE Final");
  });
}


module.exports = throttle;
