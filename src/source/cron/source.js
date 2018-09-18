/* eslint-disable no-unused-vars */
const Readable = require("stream").Readable;

const logger = require("../../logger")("serviceHost.source.cron.source");
const cron = require("../../utils/cron");
const cronMessageBuilder = require("../../messageBuilders/cronMessageBuilder");


function getSource(configuration) {
  logger.debug("getSource", configuration);

  const cronSource = new Readable({
    "objectMode": true,
    "highWaterMark": 1,

    read() {}
  });

  const cronJob = cron(configuration.cronExpression, () => {
    const cronMessage = cronMessageBuilder()
      .withEventName(configuration.cronEventName)
      .build();
    logger.debug(cronMessage.correlationId, `cron job for event:${configuration.cronEventName} expression:'${configuration.cronExpression}' executing`);
    cronSource.push(cronMessage);
  });

  cronSource.stop = () => {
    cronJob.stop();
    return Promise.resolve;
  };
  cronSource.success = message => {
    return Promise.resolve();
  };
  cronSource.retry = (message, error) => {
    return Promise.resolve();
  };
  cronSource.fail = (message, error) => {
    return Promise.resolve();
  };
  cronSource.ignore = message => {
    return Promise.resolve();
  };


  return cronSource;
}


module.exports = getSource;
