const Readable = require("stream").Readable;
const AWS = require("aws-sdk");
const logger = require("../logger")("serviceHost.awsSqsSource");
const messageBuilder = require("./messageBuilder");


AWS.config.update({"region": "eu-west-1"});
const sqs = new AWS.SQS({"apiVersion": "2012-11-05"});


function getSqsSource(configuration) {

  const awsParams = {
    "AttributeNames": [ // TODO can this come from config?
      "SentTimestamp"
    ],
    "MaxNumberOfMessages": 1, // TODO needs to come from config
    "MessageAttributeNames": [
      "All"
    ],
    "QueueUrl": configuration.queueUrl
  // ,"VisibilityTimeout": 0,
  // "WaitTimeSeconds": 0
  };

  logger.debug("getSqsSource", configuration);


  function deleteMessage(message, resolve, reject) {
    const deleteParams = {
      "QueueUrl": configuration.queueUrl,
      "ReceiptHandle": message.ReceiptHandle
    };

    logger.trace("deleteMessage:", message);
    logger.trace("deleteParams:", deleteParams);

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


  let receiveInProgress = false;

  function receiveMessageBatch(readStream) {
    if (receiveInProgress) {
      logger.debug("receive is in progress, skipping read this time");
    } else {
      receiveInProgress = true;
      sqs.receiveMessage(awsParams, (err, data) => {
        if (err) {

          // TODO Should this have a back off mechanisum for repeat failures?
          receiveInProgress = false;
          const payload = {
            "reason": "receiveMessageBatch got an error calling SQS",
            "error": err
          };
          logger.error(payload.reason, JSON.stringify(payload.error));
          const controlMessage = messageBuilder().withPayload(payload).buildControlMessage();
          readStream.push(controlMessage);

        } else if (data && data.Messages && data.Messages.length > 0) {

          logger.debug("receiveMessageBatch got data", data.Messages.length);
          data.Messages.forEach((msg, i) => {
            logger.trace("receiveMessageBatch received and processing", msg);
            const message = JSON.parse(msg.Body);
            logger.debug(message.correlationId, "receiveMessageBatch received and processing message");
            message.ReceiptHandle = msg.ReceiptHandle;
            message.attributes = msg.attributes;
            receiveInProgress = data.Messages.length > i + 1;
            readStream.push(message);
            logger.debug(message.correlationId, "pushed");
          });

        } else {

          receiveInProgress = false;
          const payload = {
            "reason": "receiveMessageBatch got no results from aws, sorry!"
          };
          logger.debug(payload.reason);
          const controlMessage = messageBuilder().withPayload(payload).buildControlMessage();
          readStream.push(controlMessage);

        }
      });
    }
  }

  const sqsSource = new Readable({
    "objectMode": true,
    "highWaterMark": configuration.readHighWaterMark,

    read() {
      logger.debug("read");
      receiveMessageBatch(this);
    }
  });

  sqsSource.success = message => {
    logger.debug(message.correlationId, "success");
    return new Promise((resolve, reject) => {
      deleteMessage(message, resolve, reject);
    });
  };

  sqsSource.retry = message => {
    logger.debug(message.correlationId, "retry");
  };

  sqsSource.fail = (message, error) => {
    logger.debug(message.correlationId, "fail", error);
  };

  sqsSource.ignore = message => {
    logger.debug(message.correlationId, "ignore");
    return new Promise((resolve, reject) => {
      deleteMessage(message, resolve, reject);
    });
  };

  return sqsSource;
}


module.exports = getSqsSource;
