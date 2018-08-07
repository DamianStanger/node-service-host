const sinon = require("sinon");
const chai = require("chai");
chai.should();

const getAwsSqsSource = require("../../../src/source/awsSqsSource");


describe("awsSqsSource", () => {
  it("should return a fully configured readStream", () => {
    const fakeReadStream = {"name": "myfakeReadStream"};
    const fakeAwsSqs = {"deleteMessage": "deleteMessageFunction", "receiveMessage": "receiveMessageFunction"};
    const configuration = {"name": "myFakeConfig"};

    function fakeGetReadStream(config, source) {
      config.should.equal(configuration);
      (typeof source.deleteMessage).should.equal("function");
      (typeof source.receiveMessage).should.equal("function");
      return fakeReadStream;
    }

    const sqsAwsSource = getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

    sqsAwsSource.should.equal(fakeReadStream);
  });

  describe.skip("the returned readStream", () => {

    it.skip("should ", () => {
      const fakeReadStream = {"name": "myfakeReadStream"};
      const fakeAwsSqs = {"deleteMessage": "deleteMessageFunction", "receiveMessage": "receiveMessageFunction"};
      const configuration = {"name": "myFakeConfig"};

      function fakeGetReadStream(config, source) {
        config.should.equal(configuration);
        source.deleteMessage.should.equal(fakeAwsSqs.deleteMessage);
        source.receiveMessage.should.equal(fakeAwsSqs.receiveMessage);
        return fakeReadStream;
      }

      const sqsAwsSource = getAwsSqsSource(configuration, fakeGetReadStream, fakeAwsSqs);

      sqsAwsSource.should.equal(fakeReadStream);
      fakeGetReadStream.calledOnce.should.be.true;
    });

  });

});
