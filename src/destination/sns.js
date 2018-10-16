const AWS = require("aws-sdk");
const logger = require("../logger")("serviceHost.destination.sns");

AWS.config.update({"region": "eu-west-1"});
const awsSns = new AWS.SNS({"apiVersion": "2010-03-31"});


function getSnsDestination(destinationConfig, sns = awsSns) {

  logger.debug(`creating sns destination with '${JSON.stringify(destinationConfig)}'`);

  function execute(message, subject) {
    const params = {
      "Message": JSON.stringify(message),
      "Subject": subject,
      "TargetArn": destinationConfig.targetSnsArn,
      "MessageAttributes": {
        "correlationId": {
          "DataType": "String",
          "StringValue": message.correlationId
        }
      }
    };

    logger.info(`${message.correlationId} - sending sns message '${params.Subject}'`);

    return sns.publish(params).promise().then(data => {
      logger.debug(message.correlationId, "Message published", data);
      return data;
    }).catch(err => {
      logger.error(message.correlationId, "Error publishing msg");
      logger.error(err);
      throw new Error(err);
    });
  }

  return {execute};
}


module.exports = getSnsDestination;
