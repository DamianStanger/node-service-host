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


suite("configuration", () => {

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

  suite("getConfiguration returns default", () => {
    test("maxConcurrency", () => {
      const config = getConfiguration();
      config.maxConcurrency.should.equal(1);
    });
    test("source", () => {
      const config = getConfiguration();
      assertSourceIsValid(config.source);
    });
    test("readHighWaterMark", () => {
      const config = getConfiguration();
      config.readHighWaterMark.should.equal(10);
    });
  });

  suite("getConfiguration uses environment variables", () => {
    test("maxConcurrency", () => {
      process.env.maxConcurrency = 66;
      const config = getConfiguration();
      config.maxConcurrency.should.equal(66);
    });
    test("source", () => {
      process.env.source = "testSource";
      const config = getConfiguration();
      assertSourceIsValid(config.source);
    });
    test("readHighWaterMark", () => {
      process.env.readHighWaterMark = 77;
      const config = getConfiguration();
      config.readHighWaterMark.should.equal(77);
    });
  });

  suite("getConfiguration returns values from passed config", () => {
    test("maxConcurrency", () => {
      const config = getConfiguration({"maxConcurrency": 111});
      config.maxConcurrency.should.equal(111);
    });
    test("source", () => {
      const config = getConfiguration({"source": "testSource"});
      assertSourceIsValid(config.source);
    });
    test("readHighWaterMark", () => {
      const config = getConfiguration({"readHighWaterMark": 222});
      config.readHighWaterMark.should.equal(222);
    });
  });
});
