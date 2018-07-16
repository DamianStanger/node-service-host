/* eslint-disable no-process-env */
const sinon = require("sinon");
const chai = require("chai");
chai.should();

const logger = require("../../src/logger");


suite("logger", () => {
  let originalLevel;

  beforeEach(() => {
    originalLevel = process.env.LOGGER_LEVEL;
    process.env.LOGGER_LEVEL = "trace";
    sinon.spy(process.stdout, "write");
  });

  afterEach(() => {
    process.env.LOGGER_LEVEL = originalLevel;
    process.stdout.write.restore();
  });

  suite("The returned logger", () => {

    const loggerMethods = ["fatal", "error", "warn", "info", "debug", "trace"];

    test("should expose all the levels as functions", () => {
      const loggerUnderTest = logger();
      loggerMethods.map(loggerMethod => {
        loggerUnderTest[loggerMethod].should.be.an("function");
      });
    });

    function assertStdoutWasCalledWithMessage(msg) {
      process.stdout.write.calledOnce.should.be.true;
      const messageJson = JSON.parse(process.stdout.write.getCall(0).args[0]);
      messageJson.msg.should.equal(msg);
    }

    loggerMethods.map(logMethod => {
      test(`${logMethod} should send data to stdout`, () => {
        const loggerUnderTest = logger();
        loggerUnderTest[logMethod](`calling method ${logMethod}`);
        assertStdoutWasCalledWithMessage(`calling method ${logMethod}`);
      });
    });

    test("level should default to silent", () => {
      Reflect.deleteProperty(process.env, "LOGGER_LEVEL");
      const loggerUnderTest = logger();
      loggerUnderTest.fatal("does not make it to stdout");
      process.stdout.write.calledOnce.should.be.false;
    });

    test("level should come from environment variable LOGGER_LEVEL", () => {
      process.env.LOGGER_LEVEL = "warn";
      const loggerUnderTest = logger();
      loggerUnderTest.info("a info message");
      loggerUnderTest.warn("a warning message");
      loggerUnderTest.info("a info message");
      assertStdoutWasCalledWithMessage("a warning message");
    });

    test("level should come from the passed in config", () => {
      const loggerUnderTest = logger("name", "warn");
      loggerUnderTest.info("a info message");
      loggerUnderTest.warn("a warning message");
      loggerUnderTest.info("a info message");
      assertStdoutWasCalledWithMessage("a warning message");
    });

    test("name should default to undefined", () => {
      Reflect.deleteProperty(process.env, "LOGGER_NAME");
      const loggerUnderTest = logger();
      loggerUnderTest.fatal("calling fatal");
      const name = JSON.parse(process.stdout.write.getCall(0).args[0]).name;
      chai.expect(name).to.be.undefined;
    });

    test("name should come from environment variable LOGGER_NAME", () => {
      process.env.LOGGER_NAME = "foobar";
      const loggerUnderTest = logger();
      loggerUnderTest.info("a info message");
      JSON.parse(process.stdout.write.getCall(0).args[0]).name.should.equal("foobar");
    });

    test("name should come from the passed in config", () => {
      const loggerUnderTest = logger("foobar");
      loggerUnderTest.trace("a trace message");
      JSON.parse(process.stdout.write.getCall(0).args[0]).name.should.equal("foobar");
    });
  });
});
