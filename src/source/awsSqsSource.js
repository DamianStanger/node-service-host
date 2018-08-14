const AWS = require("aws-sdk");
const logger = require("../logger")("serviceHost.awsSqsSource");
const readStream = require("./readStream");


AWS.config.update({"region": "eu-west-1"});
const awsSqs = new AWS.SQS({"apiVersion": "2012-11-05"});


function getSource(configuration, getReadStream = readStream, sqs = awsSqs) {

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


  function deleteMessageFromSqs(message, resolve, reject) {
    const deleteParams = {
      "QueueUrl": configuration.queueUrl,
      "ReceiptHandle": message.ReceiptHandle
    };

    logger.trace("deleteParams:", deleteParams);

    sqs.deleteMessage(deleteParams, (err, data) => {
      if (err) {
        logger.error(message.correlationId, "Error deleting msg");
        logger.error(err);
        reject(err);
      } else {
        logger.debug("Message deleted", data);
        resolve(data);
      }
    });
  }


  function receiveMessage(callback) {
    sqs.receiveMessage(awsParams, callback);
  }

  function ignore(message) {
    return new Promise((resolve, reject) => {
      deleteMessageFromSqs(message, resolve, reject);
    });
  }

  function success(message) {
    return new Promise((resolve, reject) => {
      deleteMessageFromSqs(message, resolve, reject);
    });
  }

  function retry() {
    return Promise.resolve();
  }

  function fail() {
    // send sns to configured failure/dead letter queue
    return Promise.resolve();
  }

  const source = {receiveMessage, ignore, success, retry, fail};
  return getReadStream(configuration, source);
}


module.exports = getSource;
