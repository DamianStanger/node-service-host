const fail = require("chai").fail;
const chai = require("chai");
chai.should();

const messageBuilder = require("../../../../src/source/messageBuilder");
const getAwsSnsProxy = require("../../../../src/source/aws/snsProxy");


describe("aws.snsProxy", () => {

  const configuration = {
    "errorSNS": "arn:aws:sns:us-west-2:12345678890:endpoint/ABC/DEF/GHI"
  };

  let actualPublishMessageParams;

  const fakeAwsSns = {
    "publish": params => {
      actualPublishMessageParams = params;
      const data = {"name": "fakeAwsSns_publish_data"};
      return {"promise": () => Promise.resolve(data)};
    }
  };
  const fakeAwsSnsWithErrors = {
    "publish": params => {
      actualPublishMessageParams = params;
      const error = new Error("fakeAwsSnsWithErrors_publish_data");
      return {"promise": () => Promise.reject(error)};
    }
  };

  describe("publish", () => {

    const originalMessage = messageBuilder().build();
    const error = new Error("Some failure occured");
    const failureMessage = messageBuilder().buildFailureMessage(error, originalMessage);
    const expectedPublishParams = {
      "Message": JSON.stringify(failureMessage),
      "Subject": "Some subject",
      "TargetArn": "arn:aws:sns:us-west-2:12345678890:endpoint/ABC/DEF/GHI"
    };

    it("Should call publish on sns", () => {
      const snsProxy = getAwsSnsProxy(configuration, fakeAwsSns);

      return snsProxy.publish(failureMessage).then(data => {
        actualPublishMessageParams.should.deep.equal(expectedPublishParams);
        data.name.should.equal("fakeAwsSns_publish_data");
      });
    });

    it("Should reject the promise on error", () => {
      const snsProxy = getAwsSnsProxy(configuration, fakeAwsSnsWithErrors);

      return snsProxy.publish(failureMessage)
        .then(() => fail("should throw error"))
        .catch(err => {
          actualPublishMessageParams.should.deep.equal(expectedPublishParams);
          err.message.should.equal("Error: fakeAwsSnsWithErrors_publish_data");
        });
    });
  });

});
