/* eslint-disable no-process-env */
const chai = require("chai");
chai.should();

const getConfiguration = require("../src/configuration");


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
    test("sourceFileName", () => {
      const config = getConfiguration();
      config.sourceFileName.should.match(/src.source.testSource$/);
      config.source.should.be.an("object");
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
    test("sourceFileName", () => {
      process.env.source = "testSource";
      const config = getConfiguration();
      config.sourceFileName.should.match(/src.source.testSource$/);
      config.source.should.be.an("object");
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
    test("sourceFileName", () => {
      const config = getConfiguration({"source": "testSource"});
      config.sourceFileName.should.match(/src.source.testSource$/);
      config.source.should.be.an("object");
    });
    test("readHighWaterMark", () => {
      const config = getConfiguration({"readHighWaterMark": 222});
      config.readHighWaterMark.should.equal(222);
    });
  });
});
