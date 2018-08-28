/* eslint-disable no-process-env */

const config = {
  "maxProcessingConcurrency": process.env.serviceHostMaxProcessingConcurrency || 2,
  "source": process.env.serviceHostSource || "test"
};


module.exports = config;
