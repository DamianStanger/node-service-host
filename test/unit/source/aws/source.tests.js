/* eslint-disable no-undefined */
const fail = require("chai").fail;
const chai = require("chai");
chai.should();

const getAwsSqsSource = require("../../../../src/source/aws/source");


describe("aws.source", () => {

  const fakeReadStream = {"name": "myfakeReadStream"};
  const configuration = {
    "maxNumberOfMessagesToReadInBatch": 1111,
    "queueUrl": "myQueueUrlFromConfig",
    "waitTimeSecondsWhilstReading": 2222
  };

  let actualDeleteMessageParams;
  let actualReceiveMessageParams;

  const fakeAwsSqs = {
    "deleteMessage": params => {
      actualDeleteMessageParams = params;
      const data = {"name": "fakeAwsSqs_deleteMessage_data"};
      return {"promise": () => Promise.resolve(data)};
    },
    "receiveMessage": params => {
      actualReceiveMessageParams = params;
      const data = {"name": "fakeAwsSqs_receiveMessage_data"};
      return {"promise": () => Promise.resolve(data)};
    }
  };

  const fakeAwsSqsWithErrors = {
    "deleteMessage": params => {
      actualDeleteMessageParams = params;
      const error = new Error("fakeAwsSqsWithErrors_deleteMessage_error");
      return {"promise": () => Promise.reject(error)};
    }
  };

  let actualSnsProxyFailureMessage;

  const fakeSnsProxy = {
    "publish": params => {
      actualSnsProxyFailureMessage = params;
      const data = {"name": "fakeSnsProxy_publish_data"};
      return Promise.resolve(data);
    }
  };
  const fakeSnsProxyWithErrors = {
    "publish": params => {
      actualSnsProxyFailureMessage = params;
      const error = new Error("fakeSnsProxyWithErrors_publish_data");
      return Promise.reject(error);
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
        getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

        return actualSource.receiveMessage().then(data => {
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
          data.name.should.equal("fakeAwsSqs_receiveMessage_data");
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
          .catch(err => err.message.should.equal("Error: fakeAwsSqsWithErrors_deleteMessage_error"));
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
        .catch(err => err.message.should.equal("Error: fakeAwsSqsWithErrors_deleteMessage_error"));
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
    it("Should publish sns failure message", () => {
      const error = new Error("itFailed!!");
      const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
      getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs, fakeSnsProxy);

      return actualSource.fail(error, message).then(() => {
        message.error = {
          "message": error.message,
          "stack": error.stack
        };
        actualSnsProxyFailureMessage.should.deep.equal(message);
      });
    });

    it("should delete the original message once failure message is sent", () => {
      const error = new Error("itFailed!!");
      const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
      getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs, fakeSnsProxy);

      return actualSource.fail(error, message).then(data => {
        actualDeleteMessageParams.should.deep.equal({
          "QueueUrl": "myQueueUrlFromConfig",
          "ReceiptHandle": "myReceiptHandleFromMessage"
        });
        data.name.should.equal("fakeAwsSqs_deleteMessage_data");
      });
    });

    describe("if publishing sns failure message throws an error", () => {
      it("should not delete the original message", () => {
        const error = new Error("itFailed!!");
        const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
        getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs, fakeSnsProxyWithErrors);

        actualDeleteMessageParams = undefined;

        return actualSource.fail(error, message)
          .then(() => fail("should throw error"))
          .catch(err => {
            err.message.should.equal("fakeSnsProxyWithErrors_publish_data");
            chai.expect(actualDeleteMessageParams).to.be.undefined;
          });
      });
    });
  });
});
