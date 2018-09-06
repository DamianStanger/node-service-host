const AWS = require("aws-sdk");
const logger = require("../../logger")("serviceHost.source.aws.source");
const readStream = require("../readStream");
const messageBuilder = require("../messageBuilder");
const getSnsProxy = require("./snsProxy");


AWS.config.update({"region": "eu-west-1"});
const awsSqs = new AWS.SQS({"apiVersion": "2012-11-05"});


function getSource(configuration, getReadStream = readStream, sqs = awsSqs, failureSnsProxy) {
  const awsParams = {
    "AttributeNames": [
      "All"
    ],
    "MaxNumberOfMessages": configuration.maxNumberOfMessagesToReadInBatch,
    "MessageAttributeNames": [
      "All"
    ],
    "QueueUrl": configuration.queueUrl,
    "WaitTimeSeconds": configuration.waitTimeSecondsWhilstReading
    // "VisibilityTimeout": 0
  };

  logger.debug("getSource", configuration, awsParams);

  const failureSns = failureSnsProxy || getSnsProxy(configuration.errorArn);


  function deleteMessageFromSqs(message) {
    const deleteParams = {
      "QueueUrl": configuration.queueUrl,
      "ReceiptHandle": message.ReceiptHandle
    };

    logger.trace("deleteParams:", deleteParams);

    return sqs.deleteMessage(deleteParams).promise().then(data => {
      logger.debug("Message deleted", data);
      return data;
    }).catch(err => {
      logger.error(message.correlationId, "Error deleting msg");
      logger.error(err);
      throw new Error(err);
    });
  }


  function receiveMessage() {
    return sqs.receiveMessage(awsParams).promise();
  }

  function ignore(message) {
    return deleteMessageFromSqs(message);
  }

  function success(message) {
    return deleteMessageFromSqs(message);
  }

  function retry() {
    return Promise.resolve();
  }

  function fail(error, message) {
    const failureMessage = messageBuilder().buildFailureMessage(error, message);
    const subject = `Fail message '${message.eventName}:${message.correlationId}'`;
    return failureSns.publish(failureMessage, subject).then(() => deleteMessageFromSqs(message));
  }

  const source = {receiveMessage, ignore, success, retry, fail};
  return getReadStream(configuration, source);
}


module.exports = getSource;
