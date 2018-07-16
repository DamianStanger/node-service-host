/* eslint-disable no-process-env */

const config = {
  "readHighWaterMark": 2,
  "maxConcurrency": 2,
  "source": process.env.source || "testSource"
};


module.exports = config;
