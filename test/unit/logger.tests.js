/* eslint-disable no-process-env */
const sinon = require("sinon");
const chai = require("chai");
chai.should();

const logger = require("../../src/logger");


describe("logger", () => {
  let originalLevel;

  beforeEach(() => {
    originalLevel = process.env.serviceHostLoggerLevel;
    process.env.serviceHostLoggerLevel = "trace";
    sinon.spy(process.stdout, "write");
  });

  afterEach(() => {
    process.env.serviceHostLoggerLevel = originalLevel;
    process.stdout.write.restore();
  });

  describe("The returned logger", () => {

    const loggerMethods = ["fatal", "error", "warn", "info", "debug", "trace"];

    it("should expose all the levels as functions", () => {
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
      it(`${logMethod} should send data to stdout`, () => {
        const loggerUnderTest = logger();
        loggerUnderTest[logMethod](`calling method ${logMethod}`);
        assertStdoutWasCalledWithMessage(`calling method ${logMethod}`);
      });
    });

    it("level should default to silent", () => {
      Reflect.deleteProperty(process.env, "serviceHostLoggerLevel");
      const loggerUnderTest = logger();
      loggerUnderTest.fatal("does not make it to stdout");
      process.stdout.write.calledOnce.should.be.false;
    });

    it("level should come from environment variable serviceHostLoggerLevel", () => {
      process.env.serviceHostLoggerLevel = "warn";
      const loggerUnderTest = logger();
      loggerUnderTest.info("a info message");
      loggerUnderTest.warn("a warning message");
      loggerUnderTest.info("a info message");
      assertStdoutWasCalledWithMessage("a warning message");
    });

    it("level should come from the passed in config", () => {
      const loggerUnderTest = logger("name", "warn");
      loggerUnderTest.info("a info message");
      loggerUnderTest.warn("a warning message");
      loggerUnderTest.info("a info message");
      assertStdoutWasCalledWithMessage("a warning message");
    });

    it("name should default to undefined", () => {
      const loggerUnderTest = logger();
      loggerUnderTest.fatal("calling fatal");
      const name = JSON.parse(process.stdout.write.getCall(0).args[0]).name;
      chai.expect(name).to.be.undefined;
    });

    it("name should come from the passed in config", () => {
      const loggerUnderTest = logger("foobar");
      loggerUnderTest.trace("a trace message");
      JSON.parse(process.stdout.write.getCall(0).args[0]).name.should.equal("foobar");
    });
  });
});
