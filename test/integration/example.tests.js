const {Readable} = require("stream");
const chai = require("chai");
chai.should();

const serviceHostBuilder = require("../../src/serviceHost");
const registerEvents = require("../../example/service");

const config = {
  "maxConcurrency": 1
};


// This is kept so as better to demo what is going on
// eslint-disable-next-line no-unused-vars
const dummySourcePromise = new Promise((resolve, reject) => {
  const dummySource = new Readable({
    "objectMode": true,
    "highWaterMark": 1
  });
  dummySource.success = msg => {
    resolve(`success-${msg.eventName}-${msg.version}`);
    return dummySourcePromise;
  };
  dummySource.retry = msg => {
    resolve(`retry-${msg.eventName}-${msg.version}`);
    return dummySourcePromise;
  };
  dummySource.fail = msg => {
    resolve(`fail-${msg.eventName}-${msg.version}`);
    return dummySourcePromise;
  };
  dummySource.ignore = msg => {
    resolve(`ignore-${msg.eventName}-${msg.version}`);
    return dummySourcePromise;
  };

  config.source = dummySource;
});


suite("The example service", () => {
  test("should call success", done => {
    const serviceHost = serviceHostBuilder(config);
    const message = {
      "eventName": "orderPlaced",
      "version": 1
    };

    registerEvents(serviceHost, config);
    config.source.push(message);
    config.source.push(null);
    serviceHost.start();

    dummySourcePromise.then(result => {
      result.should.equal("success-orderPlaced-1");
      done();
    }).catch(err => {
      done(err);
    });
  });
});
