/* eslint-disable no-process-env */
const chai = require("chai");
chai.should();

const getConfiguration = require("../../src/configuration");


function assertSourceIsValid(source) {
  source.should.be.an("object");
  source.read.should.be.a("function");
  source.success.should.be.a("function");
  source.retry.should.be.a("function");
  source.fail.should.be.a("function");
  source.ignore.should.be.a("function");
}
function assertDestinationIsValid(destination) {
  destination.should.be.an("object");
  destination.execute.should.be.a("function");
}


describe("configuration", () => {

  let heartbeatSource;
  function getConfigurationUnderTest(config) {
    const actualConfig = getConfiguration(config);
    heartbeatSource = actualConfig.heartbeat.source;
    return actualConfig;
  }

  beforeEach(() => {
    Reflect.deleteProperty(process.env, "serviceHostMaxNumberOfMessagesToReadInBatch");
    Reflect.deleteProperty(process.env, "serviceHostMaxProcessingConcurrency");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnError");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnNoMessages");
    Reflect.deleteProperty(process.env, "serviceHostQueueUrl");
    Reflect.deleteProperty(process.env, "serviceHostSource");
    Reflect.deleteProperty(process.env, "serviceHostWaitTimeSecondsWhilstReading");
    Reflect.deleteProperty(process.env, "serviceHostHeartbeatCronExpression");
    Reflect.deleteProperty(process.env, "serviceHostHeartbeatDestination");
    Reflect.deleteProperty(process.env, "serviceHostHeartbeatDestinationParameters");
  });

  afterEach(() => {
    Reflect.deleteProperty(process.env, "serviceHostMaxNumberOfMessagesToReadInBatch");
    Reflect.deleteProperty(process.env, "serviceHostMaxProcessingConcurrency");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnError");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnNoMessages");
    Reflect.deleteProperty(process.env, "serviceHostQueueUrl");
    Reflect.deleteProperty(process.env, "serviceHostSource");
    Reflect.deleteProperty(process.env, "serviceHostWaitTimeSecondsWhilstReading");
    Reflect.deleteProperty(process.env, "serviceHostHeartbeatCronExpression");
    Reflect.deleteProperty(process.env, "serviceHostHeartbeatDestination");
    Reflect.deleteProperty(process.env, "serviceHostHeartbeatDestinationParameters");

    if (heartbeatSource && heartbeatSource.stop) {
      heartbeatSource.stop();
    }
  });

  describe("getConfiguration returns default configuration", () => {
    it("maxNumberOfMessagesToReadInBatch", () => {
      const config = getConfigurationUnderTest();
      config.maxNumberOfMessagesToReadInBatch.should.equal(10);
    });
    it("maxProcessingConcurrency", () => {
      const config = getConfigurationUnderTest();
      config.maxProcessingConcurrency.should.equal(1);
    });
    it("millisecondsToWaitOnError", () => {
      const config = getConfigurationUnderTest();
      config.millisecondsToWaitOnError.should.equal(10000);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      const config = getConfigurationUnderTest();
      config.millisecondsToWaitOnNoMessages.should.equal(10000);
    });
    it("queueUrl", () => {
      const config = getConfigurationUnderTest();
      config.queueUrl.should.equal("");
    });
    it("source", () => {
      const config = getConfigurationUnderTest();
      assertSourceIsValid(config.source);
    });
    it("waitTimeSecondsWhilstReading", () => {
      const config = getConfigurationUnderTest();
      config.waitTimeSecondsWhilstReading.should.equal(20);
    });
    it("heartbeat", () => {
      const config = getConfigurationUnderTest();
      config.heartbeat.cronExpression.should.equal("*/30 * * * * *");
      config.heartbeat.cronEventName.should.equal("serviceHost.messages.heartbeat");
      config.heartbeat.maxProcessingConcurrency.should.equal(1);
      assertSourceIsValid(config.heartbeat.source);
      assertDestinationIsValid(config.heartbeat.destination);
      config.heartbeat.destinationParameters.should.deep.equal({});
    });
  });

  describe("getConfiguration uses environment variables", () => {
    it("maxNumberOfMessagesToReadInBatch", () => {
      process.env.serviceHostMaxNumberOfMessagesToReadInBatch = 55;
      const config = getConfigurationUnderTest();
      config.maxNumberOfMessagesToReadInBatch.should.equal(55);
    });
    it("maxProcessingConcurrency", () => {
      process.env.serviceHostMaxProcessingConcurrency = 66;
      const config = getConfigurationUnderTest();
      config.maxProcessingConcurrency.should.equal(66);
    });
    it("millisecondsToWaitOnError", () => {
      process.env.serviceHostMillisecondsToWaitOnError = 99;
      const config = getConfigurationUnderTest();
      config.millisecondsToWaitOnError.should.equal(99);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      process.env.serviceHostMillisecondsToWaitOnNoMessages = 88;
      const config = getConfigurationUnderTest();
      config.millisecondsToWaitOnNoMessages.should.equal(88);
    });
    it("queueUrl", () => {
      process.env.serviceHostQueueUrl = "MyFakeUrl";
      const config = getConfigurationUnderTest();
      config.queueUrl.should.equal("MyFakeUrl");
    });
    it("source", () => {
      process.env.serviceHostSource = "test";
      const config = getConfigurationUnderTest();
      assertSourceIsValid(config.source);
    });
    it("waitTimeSecondsWhilstReading", () => {
      process.env.serviceHostWaitTimeSecondsWhilstReading = 44;
      const config = getConfigurationUnderTest();
      config.waitTimeSecondsWhilstReading.should.equal(44);
    });
    it("heartbeat", () => {
      process.env.serviceHostHeartbeatCronExpression = "1 2 3 4 5 6";
      process.env.serviceHostHeartbeatDestination = "logging";
      process.env.serviceHostHeartbeatDestinationParameters = "{\"abc\": \"def\"}";

      const config = getConfigurationUnderTest();

      config.heartbeat.cronExpression.should.equal("1 2 3 4 5 6");
      config.heartbeat.cronEventName.should.equal("serviceHost.messages.heartbeat");
      config.heartbeat.maxProcessingConcurrency.should.equal(1);
      assertSourceIsValid(config.heartbeat.source);
      assertDestinationIsValid(config.heartbeat.destination);
      config.heartbeat.destinationParameters.should.deep.equal({"abc": "def"});
    });
  });

  describe("getConfiguration returns values from passed config", () => {
    it("maxNumberOfMessagesToReadInBatch", () => {
      const config = getConfigurationUnderTest({"maxNumberOfMessagesToReadInBatch": 666});
      config.maxNumberOfMessagesToReadInBatch.should.equal(666);
    });
    it("maxProcessingConcurrency", () => {
      const config = getConfigurationUnderTest({"maxProcessingConcurrency": 111});
      config.maxProcessingConcurrency.should.equal(111);
    });
    it("millisecondsToWaitOnError", () => {
      const config = getConfigurationUnderTest({"millisecondsToWaitOnError": 444});
      config.millisecondsToWaitOnError.should.equal(444);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      const config = getConfigurationUnderTest({"millisecondsToWaitOnNoMessages": 333});
      config.millisecondsToWaitOnNoMessages.should.equal(333);
    });
    it("queueUrl", () => {
      const config = getConfigurationUnderTest({"queueUrl": "MyFakeUrlFromConfig"});
      config.queueUrl.should.equal("MyFakeUrlFromConfig");
    });
    it("source", () => {
      const config = getConfigurationUnderTest({"source": "test"});
      assertSourceIsValid(config.source);
    });
    it("waitTimeSecondsWhilstReading", () => {
      const config = getConfigurationUnderTest({"waitTimeSecondsWhilstReading": 555});
      config.waitTimeSecondsWhilstReading.should.equal(555);
    });
    it("heartbeat", () => {
      const config = getConfigurationUnderTest({
        "heartbeat": {
          "cronExpression": "1-2 * */12 * *",
          "destination": "sns",
          "destinationParameters": {"targetArn": "arn:aws:sns:eu-west-1:123456789012:mySNSName"}
        }
      });
      config.heartbeat.cronExpression.should.equal("1-2 * */12 * *");
      config.heartbeat.cronEventName.should.equal("serviceHost.messages.heartbeat");
      config.heartbeat.maxProcessingConcurrency.should.equal(1);
      assertSourceIsValid(config.heartbeat.source);
      assertDestinationIsValid(config.heartbeat.destination);
      config.heartbeat.destinationParameters.should.deep.equal(config.heartbeat.destinationParameters);
    });
  });
});
