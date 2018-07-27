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
    Reflect.deleteProperty(process.env, "serviceHostMaxConcurrency");
    Reflect.deleteProperty(process.env, "serviceHostReadHighWaterMark");
    Reflect.deleteProperty(process.env, "serviceHostSource");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnError");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnNoMessages");
  });

  afterEach(() => {
    Reflect.deleteProperty(process.env, "serviceHostMaxConcurrency");
    Reflect.deleteProperty(process.env, "serviceHostReadHighWaterMark");
    Reflect.deleteProperty(process.env, "serviceHostSource");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnError");
    Reflect.deleteProperty(process.env, "serviceHostMillisecondsToWaitOnNoMessages");
  });

  describe("getConfiguration returns default", () => {
    it("maxConcurrency", () => {
      const config = getConfiguration();
      config.maxConcurrency.should.equal(1);
    });
    it("source", () => {
      const config = getConfiguration();
      assertSourceIsValid(config.source);
    });
    it("readHighWaterMark", () => {
      const config = getConfiguration();
      config.readHighWaterMark.should.equal(1);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      const config = getConfiguration();
      config.millisecondsToWaitOnNoMessages.should.equal(10000);
    });
    it("millisecondsToWaitOnError", () => {
      const config = getConfiguration();
      config.millisecondsToWaitOnError.should.equal(10000);
    });
  });

  describe("getConfiguration uses environment variables", () => {
    it("maxConcurrency", () => {
      process.env.serviceHostMaxConcurrency = 66;
      const config = getConfiguration();
      config.maxConcurrency.should.equal(66);
    });
    it("source", () => {
      process.env.serviceHostSource = "testSource";
      const config = getConfiguration();
      assertSourceIsValid(config.source);
    });
    it("readHighWaterMark", () => {
      process.env.serviceHostReadHighWaterMark = 77;
      const config = getConfiguration();
      config.readHighWaterMark.should.equal(77);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      process.env.serviceHostMillisecondsToWaitOnNoMessages = 88;
      const config = getConfiguration();
      config.millisecondsToWaitOnNoMessages.should.equal(88);
    });
    it("millisecondsToWaitOnError", () => {
      process.env.serviceHostMillisecondsToWaitOnError = 99;
      const config = getConfiguration();
      config.millisecondsToWaitOnError.should.equal(99);
    });
  });

  describe("getConfiguration returns values from passed config", () => {
    it("maxConcurrency", () => {
      const config = getConfiguration({"maxConcurrency": 111});
      config.maxConcurrency.should.equal(111);
    });
    it("source", () => {
      const config = getConfiguration({"source": "testSource"});
      assertSourceIsValid(config.source);
    });
    it("readHighWaterMark", () => {
      const config = getConfiguration({"readHighWaterMark": 222});
      config.readHighWaterMark.should.equal(222);
    });
    it("millisecondsToWaitOnNoMessages", () => {
      const config = getConfiguration({"millisecondsToWaitOnNoMessages": 333});
      config.millisecondsToWaitOnNoMessages.should.equal(333);
    });
    it("millisecondsToWaitOnError", () => {
      const config = getConfiguration({"millisecondsToWaitOnError": 444});
      config.millisecondsToWaitOnError.should.equal(444);
    });
  });
});
