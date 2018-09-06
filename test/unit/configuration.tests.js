/* eslint-disable no-process-env */
const chai = require("chai");
chai.should();

const getConfiguration = require("../../src/configuration");


function assertSourceIsValid(source) {
  source.should.be.an("object");
  source.success.should.be.an("function");
  source.retry.should.be.an("function");
  source.fail.should.be.an("function");
}


describe("configuration", () => {

  beforeEach(() => {
    Reflect.deleteProperty(process.env, "serviceHostMaxNumberOfMessagesToReadInBatch");
    Reflect.deleteProperty(process.env, "serviceHostMaxProcessingConcurrency");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnError");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnNoMessages");
    Reflect.deleteProperty(process.env, "serviceHostQueueUrl");
    Reflect.deleteProperty(process.env, "serviceHostSource");
    Reflect.deleteProperty(process.env, "serviceHostWaitTimeSecondsWhilstReading");
    Reflect.deleteProperty(process.env, "serviceHostHealthCheckFrequency");
  });

  afterEach(() => {
    Reflect.deleteProperty(process.env, "serviceHostMaxNumberOfMessagesToReadInBatch");
    Reflect.deleteProperty(process.env, "serviceHostMaxProcessingConcurrency");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnError");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnNoMessages");
    Reflect.deleteProperty(process.env, "serviceHostQueueUrl");
    Reflect.deleteProperty(process.env, "serviceHostSource");
    Reflect.deleteProperty(process.env, "serviceHostWaitTimeSecondsWhilstReading");
    Reflect.deleteProperty(process.env, "serviceHostHealthCheckFrequency");
  });

  describe("getConfiguration returns default", () => {
    it("maxNumberOfMessagesToReadInBatch", () => {
      const config = getConfiguration();
      config.maxNumberOfMessagesToReadInBatch.should.equal(10);
    });
    it("maxProcessingConcurrency", () => {
      const config = getConfiguration();
      config.maxProcessingConcurrency.should.equal(1);
    });
    it("millisecondsToWaitOnError", () => {
      const config = getConfiguration();
      config.millisecondsToWaitOnError.should.equal(10000);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      const config = getConfiguration();
      config.millisecondsToWaitOnNoMessages.should.equal(10000);
    });
    it("queueUrl", () => {
      const config = getConfiguration();
      config.queueUrl.should.equal("");
    });
    it("source", () => {
      const config = getConfiguration();
      assertSourceIsValid(config.source);
    });
    it("waitTimeSecondsWhilstReading", () => {
      const config = getConfiguration();
      config.waitTimeSecondsWhilstReading.should.equal(20);
    });
    it("HealthCheckFrequency", () => {
      const config = getConfiguration();
      config.HealthCheckFrequency.should.equal(30000);
    });
  });

  describe("getConfiguration uses environment variables", () => {
    it("maxNumberOfMessagesToReadInBatch", () => {
      process.env.serviceHostMaxNumberOfMessagesToReadInBatch = 55;
      const config = getConfiguration();
      config.maxNumberOfMessagesToReadInBatch.should.equal(55);
    });
    it("maxProcessingConcurrency", () => {
      process.env.serviceHostMaxProcessingConcurrency = 66;
      const config = getConfiguration();
      config.maxProcessingConcurrency.should.equal(66);
    });
    it("millisecondsToWaitOnError", () => {
      process.env.serviceHostMillisecondsToWaitOnError = 99;
      const config = getConfiguration();
      config.millisecondsToWaitOnError.should.equal(99);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      process.env.serviceHostMillisecondsToWaitOnNoMessages = 88;
      const config = getConfiguration();
      config.millisecondsToWaitOnNoMessages.should.equal(88);
    });
    it("queueUrl", () => {
      process.env.serviceHostQueueUrl = "MyFakeUrl";
      const config = getConfiguration();
      config.queueUrl.should.equal("MyFakeUrl");
    });
    it("source", () => {
      process.env.serviceHostSource = "test";
      const config = getConfiguration();
      assertSourceIsValid(config.source);
    });
    it("waitTimeSecondsWhilstReading", () => {
      process.env.serviceHostWaitTimeSecondsWhilstReading = 44;
      const config = getConfiguration();
      config.waitTimeSecondsWhilstReading.should.equal(44);
    });
    it("HealthCheckFrequency", () => {
      process.env.serviceHostHealthCheckFrequency = 55;
      const config = getConfiguration();
      config.HealthCheckFrequency.should.equal(55);
    });
  });

  describe("getConfiguration returns values from passed config", () => {
    it("maxNumberOfMessagesToReadInBatch", () => {
      const config = getConfiguration({"maxNumberOfMessagesToReadInBatch": 666});
      config.maxNumberOfMessagesToReadInBatch.should.equal(666);
    });
    it("maxProcessingConcurrency", () => {
      const config = getConfiguration({"maxProcessingConcurrency": 111});
      config.maxProcessingConcurrency.should.equal(111);
    });
    it("millisecondsToWaitOnError", () => {
      const config = getConfiguration({"millisecondsToWaitOnError": 444});
      config.millisecondsToWaitOnError.should.equal(444);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      const config = getConfiguration({"millisecondsToWaitOnNoMessages": 333});
      config.millisecondsToWaitOnNoMessages.should.equal(333);
    });
    it("queueUrl", () => {
      const config = getConfiguration({"queueUrl": "MyFakeUrlFromConfig"});
      config.queueUrl.should.equal("MyFakeUrlFromConfig");
    });
    it("source", () => {
      const config = getConfiguration({"source": "test"});
      assertSourceIsValid(config.source);
    });
    it("waitTimeSecondsWhilstReading", () => {
      const config = getConfiguration({"waitTimeSecondsWhilstReading": 555});
      config.waitTimeSecondsWhilstReading.should.equal(555);
    });
    it("HealthCheckFrequency", () => {
      const config = getConfiguration({"HealthCheckFrequency": 666});
      config.HealthCheckFrequency.should.equal(666);
    });
  });
});
