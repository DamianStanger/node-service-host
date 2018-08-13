const fail = require("chai").fail;
const chai = require("chai");
chai.should();

const getAwsSqsSource = require("../../../src/source/awsSqsSource");


describe("awsSqsSource", () => {

  const fakeReadStream = {"name": "myfakeReadStream"};
  const configuration = {
    "maxNumberOfMessagesToReadInBatch": 1111,
    "queueUrl": "myQueueUrlFromConfig",
    "waitTimeSecondsWhilstReading": 2222
  };

  let actualDeleteMessageParams;
  let actualReceiveMessageParams;
  let actualReceiveMessageCallback;

  const fakeAwsSqs = {
    "deleteMessage": (params, callback) => {
      actualDeleteMessageParams = params;
      const error = null;
      const data = {"name": "fakeAwsSqs_deleteMessage_data"};
      callback(error, data);
    },
    "receiveMessage": (params, callback) => {
      actualReceiveMessageParams = params;
      actualReceiveMessageCallback = callback;
    }
  };

  const fakeAwsSqsWithErrors = {
    "deleteMessage": (params, callback) => {
      actualDeleteMessageParams = params;
      const error = new Error("fakeAwsSqsWithErrors_deleteMessage_error");
      const data = {"name": "fakeAwsSqsWithErrors_deleteMessage_data"};
      callback(error, data);
    }
  };

  let actualSource;
  let actualConfig;

  function fakeGetReadStream(config, source) {
    actualSource = source;
    actualConfig = config;
    return fakeReadStream;
  }

  beforeEach(() => {
    actualDeleteMessageParams = null;
    actualReceiveMessageParams = null;
    actualReceiveMessageCallback = null;
    actualSource = null;
    actualConfig = null;
  });


  it("should return a fully configured readStream", () => {
    const sqsAwsSource = getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

    sqsAwsSource.should.equal(fakeReadStream);
    actualConfig.should.equal(configuration);
    (typeof actualSource.receiveMessage).should.equal("function");
    (typeof actualSource.ignore).should.equal("function");
    (typeof actualSource.success).should.equal("function");
    (typeof actualSource.retry).should.equal("function");
    (typeof actualSource.fail).should.equal("function");
  });

  describe("the returned readStream", () => {

    describe("receiveMessage", () => {
      it("Should call receiveMessage on the source", () => {
        const fakeCallback = {"name": "myFakeCallback-receiveMessage"};
        getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

        actualSource.receiveMessage(fakeCallback);

        actualReceiveMessageCallback.should.equal(fakeCallback);
        actualReceiveMessageParams.should.deep.equal({
          "AttributeNames": [
            "All"
          ],
          "MaxNumberOfMessages": 1111,
          "MessageAttributeNames": [
            "All"
          ],
          "QueueUrl": "myQueueUrlFromConfig",
          "WaitTimeSeconds": 2222
        });
      });
    });

    describe("success", () => {
      it("Should call deleteMessage on the source", () => {
        const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
        getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

        return actualSource.success(message).then(data => {
          actualDeleteMessageParams.should.deep.equal({
            "QueueUrl": "myQueueUrlFromConfig",
            "ReceiptHandle": "myReceiptHandleFromMessage"
          });
          data.name.should.equal("fakeAwsSqs_deleteMessage_data");
        });
      });

      it("Should reject the promise on error", () => {
        const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
        getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqsWithErrors);

        return actualSource.success(message)
          .then(() => fail("should throw error"))
          .catch(err => err.message.should.equal("fakeAwsSqsWithErrors_deleteMessage_error"));
      });
    });
  });

  describe("ignore", () => {
    it("Should call deleteMessage on the source", () => {
      const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
      getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

      return actualSource.ignore(message).then(data => {
        actualDeleteMessageParams.should.deep.equal({
          "QueueUrl": "myQueueUrlFromConfig",
          "ReceiptHandle": "myReceiptHandleFromMessage"
        });
        data.name.should.equal("fakeAwsSqs_deleteMessage_data");
      });
    });

    it("Should reject the promise on error", () => {
      const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
      getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqsWithErrors);

      return actualSource.ignore(message)
        .then(() => fail("should throw error"))
        .catch(err => err.message.should.equal("fakeAwsSqsWithErrors_deleteMessage_error"));
    });
  });

  describe("retry", () => {
    it("Should do nothing", () => {
      const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
      getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

      return actualSource.retry(message).then(() => {});

      // TODO Assert some things
    });
  });

  describe("fail", () => {
    it("Should do nothing", () => {
      const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
      getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

      return actualSource.fail(message).then(() => {});

      // TODO Assert some things
    });
  });
});
