const fail = require("chai").fail;
const chai = require("chai");
chai.should();

const messageBuilder = require("../../../src/messageBuilders/messageBuilder");
const getSqsDestination = require("../../../src/destination/sqs");


describe("destination/sqs", () => {

  const destinationConfig = {
    "targetSqsUrl": "http://aaa.bbb.cccc"
  };

  let actualSendMessageParams;

  const fakeAwsSqs = {
    "sendMessage": params => {
      actualSendMessageParams = params;
      const data = {"name": "fakeAwsSqs_send_data"};
      return {"promise": () => Promise.resolve(data)};
    }
  };
  const fakeAwsSqsWithErrors = {
    "sendMessage": params => {
      actualSendMessageParams = params;
      const error = new Error("fakeAwsSqsWithErrors_send_data");
      return {"promise": () => Promise.reject(error)};
    }
  };

  describe("execute", () => {

    const originalMessage = messageBuilder().build();
    const error = new Error("Some failure occurred");
    const failureMessage = messageBuilder().buildFailureMessage(error, originalMessage);
    const expectedSendParams = {
      "MessageAttributes": {
        "subject": {
          "DataType": "String",
          "StringValue": "Some subject"
        },
        "correlationId": {
          "DataType": "String",
          "StringValue": failureMessage.correlationId
        }
      },
      "MessageBody": JSON.stringify(failureMessage),
      "QueueUrl": "http://aaa.bbb.cccc"
    };

    it("Should call send on sqs", () => {
      const sqsDestination = getSqsDestination(destinationConfig, fakeAwsSqs);

      return sqsDestination.execute(failureMessage, "Some subject").then(data => {
        actualSendMessageParams.should.deep.equal(expectedSendParams);
        data.name.should.equal("fakeAwsSqs_send_data");
      });
    });

    it("Should reject the promise on error", () => {
      const sqsDestination = getSqsDestination(destinationConfig, fakeAwsSqsWithErrors);

      return sqsDestination.execute(failureMessage, "Some subject")
        .then(() => fail("should throw error"))
        .catch(err => {
          actualSendMessageParams.should.deep.equal(expectedSendParams);
          err.message.should.equal("Error: fakeAwsSqsWithErrors_send_data");
        });
    });
  });

});
