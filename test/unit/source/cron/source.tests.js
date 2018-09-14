const chai = require("chai");
chai.should();

const getCronSource = require("../../../../src/source/cron/source");
const config = {
  "cronExpression": "* * * * * *",
  "cronEventName": "cronTestEventName"
};

describe("cron.source", () => {
  it("should create and start a cron job", () => {
    const cronSource = getCronSource(config);

    const dataPromise = new Promise(resolve => {
      cronSource.on("data", message => {
        message.eventName.should.equal("cronTestEventName");
        cronSource.stop();
        resolve();
      });
    });

    return dataPromise;
  });

  it("should run multiple independent cron jobs", () => {
    const cronSource1 = getCronSource({"cronExpression": "* * * * * *", "cronEventName": "cronJob-1"});
    const cronSource2 = getCronSource({"cronExpression": "* * * * * *", "cronEventName": "cronJob-2"});

    let cronJob1Fired = false;
    let cronJob2Fired = false;


    const cronPromise1 = new Promise(resolve => {
      cronSource1.on("data", message => {
        message.eventName.should.equal("cronJob-1");
        if (cronJob1Fired) {
          cronSource1.stop();
          resolve();
        }
        cronJob1Fired = true;
      });
    });

    const cronPromise2 = new Promise(resolve => {
      cronSource2.on("data", message => {
        message.eventName.should.equal("cronJob-2");
        if (cronJob2Fired) {
          cronSource2.stop();
          resolve();
        }
        cronJob2Fired = true;
      });
    });

    return Promise.all([cronPromise1, cronPromise2]);
  });

  describe("succeed", () => {
    it("should do nothing", () => {
      const cronSource = getCronSource(config);

      cronSource.success({});

      cronSource.stop();
    });
  });

  describe("retry", () => {
    it("should do nothing", () => {
      const cronSource = getCronSource(config);

      cronSource.retry({});

      cronSource.stop();
    });
  });

  describe("fail", () => {
    it("should do nothing", () => {
      const cronSource = getCronSource(config);

      cronSource.fail({});

      cronSource.stop();
    });
  });

  describe("ignore", () => {
    it("should do nothing", () => {
      const cronSource = getCronSource(config);

      cronSource.ignore({});

      cronSource.stop();
    });
  });
});
