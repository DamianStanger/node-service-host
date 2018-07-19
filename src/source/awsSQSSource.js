const Readable = require("stream").Readable;
const AWS = require("aws-sdk");
const logger = require("../logger")("serviceHost.awsSQSSource");


AWS.config.update({"region": "eu-west-1"});
const sqs = new AWS.SQS({"apiVersion": "2012-11-05"});
const queueURL = process.env.QueueUrl;


const params = {
  "AttributeNames": [
    "SentTimestamp"
  ],
  "MaxNumberOfMessages": 1,
  "MessageAttributeNames": [
    "All"
  ],
  "QueueUrl": queueURL,
  "VisibilityTimeout": 0,
  "WaitTimeSeconds": 0
};


function deleteMessage(message, resolve, reject) {
  const deleteParams = {
    "QueueUrl": queueURL,
    "ReceiptHandle": message.ReceiptHandle
  };

  logger.debug("deleteMessage:", message);
  logger.debug("deleteParams:", deleteParams);

  sqs.deleteMessage(deleteParams, function (err, data) {
    if (err) {
      logger.error("Error deleting msg", err);
      reject(err);
    } else {
      logger.debug("Message deleted", data);
      resolve(message);
    }
  });
}


function getSqsSource(configuration) {
  const sqsSource = new Readable({
    "objectMode": true,
    "highWaterMark": configuration.readHighWaterMark,

    read() {
      sqs.receiveMessage(params, (err, data) => {
        if (err) {
          logger.error("SQS receive message error", err);
        } else if (data.Messages) {
          data.Messages.forEach(msg => {
            logger.debug("msg", msg);
            const message = JSON.parse(msg.Body);
            logger.debug("message", message);
            message.ReceiptHandle = msg.ReceiptHandle;
            this.push(message);
          });
        }
      });
    }
  });

  sqsSource.success = message => {
    return new Promise((resolve, reject) => {
      deleteMessage(message, resolve, reject);
    });
  };

  sqsSource.retry = message => {
  };

  sqsSource.fail = (message, error) => {
  };

  sqsSource.ignore = message => {
    return new Promise((resolve, reject) => {
      deleteMessage(message, resolve, reject);
    });
  };

  return sqsSource;
}


module.exports = getSqsSource;
