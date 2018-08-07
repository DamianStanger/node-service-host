/* eslint-disable no-process-env */

const config = {
  "maxProcessingConcurrency": process.env.serviceHostMaxProcessingConcurrency || 2,
  "source": process.env.serviceHostSource || "testSource"
};


module.exports = config;
