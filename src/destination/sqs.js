// const logger = require("../logger")("serviceHost.destination.sqs");


function getSqsDestination() {
  const sqsDestination = {
    "execute"() {
      return Promise.resolve();
    }
  };
  return sqsDestination;
}


module.exports = getSqsDestination;
