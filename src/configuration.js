/* eslint-disable no-process-env */
const path = require("path");
const logger = require("./logger")("serviceHost.configuration");


function getConfiguration(config = {}) {

  const queueUrl = config.queueUrl || process.env.serviceHostQueueUrl || "";
  const maxNumberOfMessagesToReadInBatch = config.maxNumberOfMessagesToReadInBatch || process.env.serviceHostMaxNumberOfMessagesToReadInBatch || 10;
  const maxProcessingConcurrency = config.maxProcessingConcurrency || process.env.serviceHostMaxProcessingConcurrency || 1;
  const millisecondsToWaitOnNoMessages = config.millisecondsToWaitOnNoMessages || process.env.serviceHostMillisecondsToWaitOnNoMessages || 10000;
  const millisecondsToWaitOnError = config.millisecondsToWaitOnError || process.env.serviceHostMillisecondsToWaitOnError || 10000;
  const waitTimeSecondsWhilstReading = config.waitTimeSecondsWhilstReading || process.env.serviceHostWaitTimeSecondsWhilstReading || 20;

  const configuration = {
    "queueUrl": queueUrl,
    "maxNumberOfMessagesToReadInBatch": parseInt(maxNumberOfMessagesToReadInBatch, 10),
    "maxProcessingConcurrency": parseInt(maxProcessingConcurrency, 10),
    "millisecondsToWaitOnNoMessages": parseInt(millisecondsToWaitOnNoMessages, 10),
    "millisecondsToWaitOnError": parseInt(millisecondsToWaitOnError, 10),
    "waitTimeSecondsWhilstReading": parseInt(waitTimeSecondsWhilstReading, 10)
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
