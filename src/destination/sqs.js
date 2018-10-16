const AWS = require("aws-sdk");
const logger = require("../logger")("serviceHost.destination.sqs");

AWS.config.update({"region": "eu-west-1"});
const awsSqs = new AWS.SQS({"apiVersion": "2012-11-05"});


function getSqsDestination(destinationConfig, sqs = awsSqs) {

  logger.debug(`creating sqs destination with '${JSON.stringify(destinationConfig)}'`);

  const sqsDestination = {
    "execute"(message, subject) {
      logger.trace(message.correlationId, "execute", subject);

      const params = {
        "MessageAttributes": {
          "subject": {
            "DataType": "String",
            "StringValue": subject
          },
          "correlationId": {
            "DataType": "String",
            "StringValue": message.correlationId
          }
        },
        "MessageBody": JSON.stringify(message),
        "QueueUrl": destinationConfig.targetSqsUrl
      };

      return sqs.sendMessage(params).promise().then(data => {
        logger.debug(message.correlationId, "Message sent", data);
        return data;
      }).catch(err => {
        logger.error(message.correlationId, "Error sending msg");
        logger.error(err);
        throw new Error(err);
      });
    }
  };

  return sqsDestination;
}


module.exports = getSqsDestination;
