/* eslint-disable no-process-env */
const path = require("path");
const logger = require("./logger")("serviceHost.configuration");


function getConfiguration(config = {}) {

  const queueUrl = config.queueUrl || process.env.serviceHostQueueUrl || "";
  const readHighWaterMark = config.readHighWaterMark || process.env.serviceHostReadHighWaterMark || 1;
  const maxConcurrency = config.maxConcurrency || process.env.serviceHostMaxConcurrency || 1;
  const millisecondsToWaitOnNoMessages = config.millisecondsToWaitOnNoMessages || process.env.serviceHostMillisecondsToWaitOnNoMessages || 10000;
  const millisecondsToWaitOnError = config.millisecondsToWaitOnError || process.env.serviceHostMillisecondsToWaitOnError || 10000;
  const configuration = {
    "queueUrl": queueUrl,
    "readHighWaterMark": parseInt(readHighWaterMark, 10),
    "maxConcurrency": parseInt(maxConcurrency, 10),
    "millisecondsToWaitOnNoMessages": parseInt(millisecondsToWaitOnNoMessages, 10),
    "millisecondsToWaitOnError": parseInt(millisecondsToWaitOnError, 10)
  };

  function getSource() {
    if (config.source && typeof (config.source) === "object") {
      return config.source;
    }

    let sourceFileName = config.source || process.env.serviceHostSource || "testSource";
    sourceFileName = path.join(process.cwd(), "src", "source", sourceFileName);
    return require(sourceFileName)(configuration);
  }

  configuration.source = getSource();

  logger.debug("Config set to", configuration);

  return configuration;
}


module.exports = getConfiguration;
