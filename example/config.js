/* eslint-disable no-process-env */

const config = {
  "readHighWaterMark": process.env.readHighWaterMark || 2,
  "maxConcurrency": process.env.maxConcurrency || 2,
  "source": process.env.source || "testSource"
};


module.exports = config;
