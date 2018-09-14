const CronJob = require("cron").CronJob;

const logger = require("../logger")("serviceHost.utils.cron");


function cron(cronExpression, functionToExecute) {
  try {
    logger.debug(`Creating the cronJob '${cronExpression}'`);
    const cronJob = new CronJob(cronExpression, functionToExecute);
    cronJob.start();
    return cronJob;
  } catch (err) {
    logger.error(`There was an error creating the cronJob '${cronExpression}'.`, err);
    throw err;
  }
}


module.exports = cron;
