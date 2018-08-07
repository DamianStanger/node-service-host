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
  let actualDeleteMessageCallback;
  let actualReceiveMessageParams;
  let actualReceiveMessageCallback;

  const fakeAwsSqs = {
    "deleteMessage": (params, callback) => {
      actualDeleteMessageParams = params;
      actualDeleteMessageCallback = callback;
    },
    "receiveMessage": (params, callback) => {
      actualReceiveMessageParams = params;
      actualReceiveMessageCallback = callback;
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
    actualDeleteMessageParams = undefined;
    actualDeleteMessageCallback = undefined;
    actualReceiveMessageParams = undefined;
    actualReceiveMessageCallback = undefined;
    actualSource = undefined;
    actualConfig = undefined;
  });


  it("should return a fully configured readStream", () => {
    const sqsAwsSource = getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

    sqsAwsSource.should.equal(fakeReadStream);
    actualConfig.should.equal(configuration);
    (typeof actualSource.deleteMessage).should.equal("function");
    (typeof actualSource.receiveMessage).should.equal("function");
  });

  describe("the returned readStream", () => {
    it("Should call receiveMessage", () => {
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

    it("Should call deleteMessage", () => {
      const fakeCallback = {"name": "myFakeCallback-deleteMessage"};
      const message = {"ReceiptHandle": "myReceiptHandleFromMessage"};
      getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

      actualSource.deleteMessage(message, fakeCallback);

      actualDeleteMessageCallback.should.equal(fakeCallback);
      actualDeleteMessageParams.should.deep.equal({
        "QueueUrl": "myQueueUrlFromConfig",
        "ReceiptHandle": "myReceiptHandleFromMessage"
      });
    });

  });

});
