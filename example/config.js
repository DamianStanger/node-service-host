/* eslint-disable no-process-env */

const config = {
  "readHighWaterMark": process.env.serviceHostReadHighWaterMark || 2,
  "maxProcessingConcurrency": process.env.serviceHostMaxProcessingConcurrency || 2,
  "source": process.env.serviceHostSource || "testSource"
};


module.exports = config;
