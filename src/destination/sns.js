// const logger = require("../logger")("serviceHost.destination.sns");


function getSnsDestination() {
  const snsDestination = {
    "execute"() {
      return Promise.resolve(() => {});
    }
  };
  return snsDestination;
}


module.exports = getSnsDestination;
