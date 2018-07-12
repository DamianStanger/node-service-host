/* eslint-disable no-console */

const AWS = require("aws-sdk");
AWS.config.update({"region": "REGION"});
const sqs = new AWS.SQS({"apiVersion": "2012-11-05"});
const queueURL = "SQS_QUEUE_URL";

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


sqs.receiveMessage(params, function (err, data) {
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
    const deleteParams = {
      "QueueUrl": queueURL,
      "ReceiptHandle": data.Messages[0].ReceiptHandle
    };
    sqs.deleteMessage(deleteParams, function (err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
  }
});
