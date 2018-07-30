const logger = require("../logger")("serviceHost.mockAwsSqsSource");
const readStream = require("./readStream");


function getSource(configuration) {
  logger.debug("getSource", configuration);

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

  function receiveMessage(callback) {
    setTimeout(() => {
      callback(mockErr.shift(), mockData.shift());
    }, 1000);
  }

  function deleteMessage(message, callback) {
    let deleteError;
    const deleteData = `deletedTheMessage:${message.ReceiptHandle}`;

    setTimeout(() => {
      callback(deleteError, deleteData);
    }, 1000);
  }


  const source = {receiveMessage, deleteMessage};
  return readStream(configuration, source);
}


module.exports = getSource;
