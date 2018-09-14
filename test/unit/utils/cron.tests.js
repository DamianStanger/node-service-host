const chai = require("chai");
chai.should();

const cron = require("../../../src/utils/cron");


describe("cron", () => {
  it("should throw error when cron expression is invalid", () => {
    function useInvalidExpression() {
      return cron("invalid cron expression", () => {});
    }

    useInvalidExpression.should.throw(Error);
  });

  it("should execute cron job every second", done => {
    // eslint-disable-next-line prefer-const
    let cronJob;
    let functionCalled = false;

    function functionToExecute() {
      if (functionCalled) {
        cronJob.stop();
        done();
      }
      functionCalled = true;
    }

    cronJob = cron("*/1 * * * * *", functionToExecute);
  });
});
