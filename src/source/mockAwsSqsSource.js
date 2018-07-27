const Readable = require("stream").Readable;
const logger = require("../logger")("serviceHost.mockAwsSqsSource");
const messageBuilder = require("./messageBuilder");


function getSqsSource(configuration) {
  logger.debug("getSqsSource", configuration);

  function mockDeleteMessage(deleteParams, callback) {
  // const err = new Error("foobar");
    let deleteError;
    const deleteData = `deletedTheMessage:${deleteParams.ReceiptHandle}`;

    setTimeout(() => {
      callback(deleteError, deleteData);
    }, 1000);
  }

  function deleteMessage(message, resolve, reject) {
    const deleteParams = {
      "QueueUrl": configuration.queueUrl,
      "ReceiptHandle": message.ReceiptHandle
    };

    logger.trace("deleteMessage:", message);
    logger.trace("deleteParams:", deleteParams);

    mockDeleteMessage(deleteParams, function (err, data) {
      if (err) {
        logger.error("Error deleting msg", err);
        reject(err);
      } else {
        logger.debug("Message deleted", data);
        resolve(message);
      }
    });
  }


  const mockErr = [null, null, null, {"message": "foobarError", "stack": "some code here"}];
  const mockData = [
    {
      "Messages": [
        {
          "Body": "{\"correlationId\": \"00000000-0000-0000-0000-000000000001\", \"payload\": \"ewogICAgImEiOiAiYiIsCiAgICAiYyI6IHsKICAgICAgImQiOiAxMC41CiAgICB9CiAgfQ==\", \"version\": 1, \"eventName\": \"orderPlaced\"}",
          "ReceiptHandle": "00000000000000001",
          "Attributes": {
            "SentTimestamp": "1532638517885"
          }
          // },
          // {
          //   "Body": "{\"correlationId\": \"00000000-0000-0000-0000-000000000002\", \"payload\": \"ewogICAgImEiOiAiYiIsCiAgICAiYyI6IHsKICAgICAgImQiOiAxMC41CiAgICB9CiAgfQ==\", \"version\": 1, \"eventName\": \"orderPlaced\"}",
          //   "ReceiptHandle": "00000000000000002"
        }
      ]
      // },
      // {
      //   "Messages": []
      // },
      // {
      //   "Messages": []
      // },
      // {
      //   "Messages": [
      //     {
      //       "Body": "{\"correlationId\": \"00000000-0000-0000-0000-000000000011\", \"payload\": \"ewogICAgImEiOiAiYiIsCiAgICAiYyI6IHsKICAgICAgImQiOiAxMC41CiAgICB9CiAgfQ==\", \"version\": 1, \"eventName\": \"orderPlaced\"}",
      //       "ReceiptHandle": "00000000000000011"
      //     }
      //   ]
    }];

  function mockReceiveMessages(params, callback) {
    setTimeout(() => {
      callback(mockErr.shift(), mockData.shift());
    }, 1000);
  }


  let receiveInProgress = false;

  function receiveMessageBatch(readStream) {
    if (receiveInProgress) {
      logger.debug("receive is in progress, skipping read this time");
    } else {
      receiveInProgress = true;
      mockReceiveMessages({}, (err, data) => {
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

  const mockSqsSource = new Readable({
    "objectMode": true,
    "highWaterMark": configuration.readHighWaterMark,

    read() {
      logger.debug("read");
      receiveMessageBatch(this);
    }
  });

  mockSqsSource.success = message => {
    logger.debug(message.correlationId, "success");
    return new Promise((resolve, reject) => {
      deleteMessage(message, resolve, reject);
    });
  };

  mockSqsSource.retry = message => {
    logger.debug(message.correlationId, "retry");
  };

  mockSqsSource.fail = (message, error) => {
    logger.debug(message.correlationId, "fail", error);
  };

  mockSqsSource.ignore = message => {
    logger.debug(message.correlationId, "ignore");
    return new Promise((resolve, reject) => {
      deleteMessage(message, resolve, reject);
    });
  };

  return mockSqsSource;
}


module.exports = getSqsSource;
