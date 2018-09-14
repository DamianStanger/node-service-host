/* eslint-disable no-process-env */
const path = require("path");
const logger = require("./logger")("serviceHost.configuration");


function getSource(config) {
  if (config.source && typeof (config.source) === "object") {
    return config.source;
  }

  const sourceFileName = path.join(process.cwd(), "src", "source", config.source, "source");
  return require(sourceFileName)(config);
}


// eslint-disable-next-line complexity
function getConfiguration(config = {}) {

  const source = config.source || process.env.serviceHostSource || "test";
  const queueUrl = config.queueUrl || process.env.serviceHostQueueUrl || "";
  const errorArn = config.errorArn || process.env.serviceHostErrorArn || "";
  const maxNumberOfMessagesToReadInBatch = config.maxNumberOfMessagesToReadInBatch || process.env.serviceHostMaxNumberOfMessagesToReadInBatch || 10;
  const maxProcessingConcurrency = config.maxProcessingConcurrency || process.env.serviceHostMaxProcessingConcurrency || 1;
  const millisecondsToWaitOnNoMessages = config.millisecondsToWaitOnNoMessages || process.env.serviceHostMillisecondsToWaitOnNoMessages || 10000;
  const millisecondsToWaitOnError = config.millisecondsToWaitOnError || process.env.serviceHostMillisecondsToWaitOnError || 10000;
  const waitTimeSecondsWhilstReading = config.waitTimeSecondsWhilstReading || process.env.serviceHostWaitTimeSecondsWhilstReading || 20;
  const heartbeatSource = (config.heartbeat && config.heartbeat.source) || "cron";
  const heartbeatCronExpression = (config.heartbeat && config.heartbeat.cronExpression) || process.env.serviceHostHeartbeatCronExpression || "*/30 * * * * *";

  const configuration = {
    "source": source,
    "queueUrl": queueUrl,
    "errorArn": errorArn,
    "maxNumberOfMessagesToReadInBatch": parseInt(maxNumberOfMessagesToReadInBatch, 10),
    "maxProcessingConcurrency": parseInt(maxProcessingConcurrency, 10),
    "millisecondsToWaitOnNoMessages": parseInt(millisecondsToWaitOnNoMessages, 10),
    "millisecondsToWaitOnError": parseInt(millisecondsToWaitOnError, 10),
    "waitTimeSecondsWhilstReading": parseInt(waitTimeSecondsWhilstReading, 10),
    "heartbeat": {
      "source": heartbeatSource,
      "cronEventName": "serviceHost.messages.heartbeat",
      "cronExpression": heartbeatCronExpression,
      "maxProcessingConcurrency": 1
    }
  };

  configuration.source = getSource(configuration);
  configuration.heartbeat.source = getSource(configuration.heartbeat);

  logger.debug("Config set to", configuration);

  return configuration;
}


module.exports = getConfiguration;
