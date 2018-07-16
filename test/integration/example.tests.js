const {Readable} = require("stream");
const chai = require("chai");
chai.should();

const serviceHostBuilder = require("../../src/serviceHost");
const registerEvents = require("../../example/service");

const config = {
  "maxConcurrency": 1
};
const dummySourcePromise = new Promise((resolve, reject) => {
  const dummySource = new Readable({
    "objectMode": true,
    "highWaterMark": 1
  });
  dummySource.success = msg => {
    resolve(`success-${msg.id}`);
    return dummySourcePromise;
  };
  dummySource.retry = msg => {
    resolve(`retry-${msg.id}`);
    return dummySourcePromise;
  };
  dummySource.fail = msg => {
    reject(`fail-${msg.id}`);
    return dummySourcePromise;
  };

  config.source = dummySource;

});


suite("The example service", () => {
  test("should call success", done => {
    const serviceHost = serviceHostBuilder(config);
    const message = {
      "id": "foobar59"
    };

    registerEvents(serviceHost, config);
    config.source.push(message);
    config.source.push(null);
    serviceHost.start();

    dummySourcePromise.then(result => {
      result.should.equal("success-foobar59");
      done();
    }).catch(err => {
      done(err);
    });
  });
});
