const {Readable} = require("stream");
const chai = require("chai");
chai.should();

const messageBuilder = require("../../src/source/messageBuilder");
const serviceHostBuilder = require("../../src/serviceHost");
const registerEvents = require("../../example/service");


describe("The example service", () => {

  let config;
  let dummySourcePromise;

  beforeEach(() => {
    config = {
      "maxProcessingConcurrency": 1
    };

    dummySourcePromise = new Promise(resolve => {
      const dummySource = new Readable({
        "objectMode": true,
        "highWaterMark": 1
      });
      dummySource.success = msg => {
        resolve(`success-${msg.eventName}-${msg.version}`);
        return dummySourcePromise;
      };
      dummySource.retry = (msg, err) => {
        resolve(`retry-${err}`);
        return dummySourcePromise;
      };
      dummySource.fail = (msg, err) => {
        resolve(`fail-${err}`);
        return dummySourcePromise;
      };
      dummySource.ignore = msg => {
        resolve(`ignore-${msg.eventName}-${msg.version}`);
        return dummySourcePromise;
      };

      config.source = dummySource;
    });
  });


  it("should call success on processing an orderPlaced event", done => {
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

      // You can also assert other things that the handler should have done here
      // For example: Changes to data in a DB
      // Messages/events put onto queues

      done();
    }).catch(err => {
      done(err);
    });
  });

  it("should call ignore an orderCancelled event", done => {
    const serviceHost = serviceHostBuilder(config);
    const message = messageBuilder().withEventName("orderCancelled").withVersion(1).build();

    registerEvents(serviceHost, config);
    config.source.push(message);
    config.source.push(null);
    serviceHost.start();

    dummySourcePromise.then(result => {
      result.should.equal("ignore-orderCancelled-1");
      done();
    }).catch(err => {
      done(err);
    });
  });

  it("should call ignore an orderPlaced event with different Version", done => {
    const serviceHost = serviceHostBuilder(config);
    const message = messageBuilder().withEventName("orderPlaced").withVersion(2).build();

    registerEvents(serviceHost, config);
    config.source.push(message);
    config.source.push(null);
    serviceHost.start();

    dummySourcePromise.then(result => {
      result.should.equal("ignore-orderPlaced-2");
      done();
    }).catch(err => {
      done(err);
    });
  });

  it("should call retry when an uncaught error occurs", done => {
    const serviceHost = serviceHostBuilder(config);
    const payload = {
      "simulateFailure": "Hard coded error"
    };
    const message = messageBuilder().withEventName("orderPlaced").withVersion(1).withPayload(payload).build();

    registerEvents(serviceHost, config);
    config.source.push(message);
    config.source.push(null);
    serviceHost.start();

    dummySourcePromise.then(result => {
      result.should.equal("retry-Error: Hard coded error");
      done();
    }).catch(err => {
      done(err);
    });
  });

  it("should call fail when a fatal error occurs", done => {
    const serviceHost = serviceHostBuilder(config);
    const payload = {
      "simulateFailure": "someFatalNonRecoverableErrorOccured"
    };
    const message = messageBuilder().withEventName("orderPlaced").withVersion(1).withPayload(payload).build();

    registerEvents(serviceHost, config);
    config.source.push(message);
    config.source.push(null);
    serviceHost.start();

    dummySourcePromise.then(result => {
      result.should.equal("fail-Error: someFatalNonRecoverableErrorOccured");
      done();
    }).catch(err => {
      done(err);
    });
  });

});
