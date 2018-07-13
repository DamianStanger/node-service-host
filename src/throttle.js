/* eslint-disable no-console */


function throttle(readStream, messageDelegator, maxConcurrency) {

  let inProgress = 0;

  function checkConcurrency() {
    if (inProgress >= maxConcurrency) {
      readStream.pause();
      // console.log(`throttle - ${inProgress} Write pausing`);
    } else {
      readStream.resume();
      // console.log(`throttle - ${inProgress} Write resumed`);
    }
  }

  function callAsync(message) {

    function asyncDone() {
      readStream.resume();
      inProgress--;
      // console.log(`throttle - ${message.correlationId} - ${inProgress} Write finished`);
    }

    messageDelegator(message).then(asyncDone);
    inProgress++;

    checkConcurrency();
  }

  readStream.on("data", message => {
    callAsync(message);
  });

  readStream.on("end", () => {
    console.log("throttle - end reached!");
  });
}


module.exports = throttle;
