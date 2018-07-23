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
    Reflect.deleteProperty(process.env, "maxConcurrency");
    Reflect.deleteProperty(process.env, "readHighWaterMark");
    Reflect.deleteProperty(process.env, "source");
  });

  afterEach(() => {
    Reflect.deleteProperty(process.env, "maxConcurrency");
    Reflect.deleteProperty(process.env, "readHighWaterMark");
    Reflect.deleteProperty(process.env, "source");
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
      config.readHighWaterMark.should.equal(10);
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
  });
});
