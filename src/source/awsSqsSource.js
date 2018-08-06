const AWS = require("aws-sdk");
const logger = require("../logger")("serviceHost.awsSqsSource");
const readStream = require("./readStream");


AWS.config.update({"region": "eu-west-1"});
const awsSqs = new AWS.SQS({"apiVersion": "2012-11-05"});


function getSource(configuration, sqs = awsSqs) {

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


  function deleteMessage(message, callback) {
    const deleteParams = {
      "QueueUrl": configuration.queueUrl,
      "ReceiptHandle": message.ReceiptHandle
    };

    logger.trace("deleteParams:", deleteParams);
    sqs.deleteMessage(deleteParams, callback);
  }

  function receiveMessage(callback) {
    sqs.receiveMessage(awsParams, callback);
  }

  const source = {receiveMessage, deleteMessage};
  return readStream(configuration, source);
}


module.exports = getSource;
