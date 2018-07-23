/* eslint-disable no-process-env */

const config = {
  "readHighWaterMark": process.env.serviceHostReadHighWaterMark || 2,
  "maxConcurrency": process.env.serviceHostMaxConcurrency || 2,
  "source": process.env.serviceHostSource || "testSource"
};


module.exports = config;
