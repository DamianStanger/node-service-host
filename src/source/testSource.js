/* eslint-disable no-undefined,no-console */

const {Readable} = require("stream");


let index = 0;

function messageBuilder() {
  let eventName = "orderPlaced";
  let version = 1;
  let payload = "";
  let correlationId = `00000000-0000-0000-0000-00000000000${index++}`;

  return {
    "withEventName"(theName) {
      eventName = theName;
      return this;
    },
    "withVersion"(theVersion) {
      version = theVersion;
      return this;
    },
    "withPayload"(thePayload) {
      payload = thePayload;
      return this;
    },
    "withCorrelationId"(theCorrelationId) {
      correlationId = theCorrelationId;
      return this;
    },
    "build"() {
      return {eventName, version, payload, correlationId};
    }
  };
}

const unstructuredMessage = {
  "myName": "foo",
  "requestId": "1000000002",
  "data": {
    "id": 123456,
    "stuff": "unstructured messages like this do exist !"
  }
};

function getTestMessages() {
  return [
    messageBuilder().build(),
    messageBuilder().withVersion(undefined).build(),
    messageBuilder().withVersion(undefined).withEvent(undefined).build(),
    messageBuilder().withVersion(undefined).withEvent(undefined).withPayload(undefined).build(),
    messageBuilder().withVersion(undefined).withEvent(undefined).withPayload(undefined).withCorrelationId(undefined).build(),
    unstructuredMessage
  ];
}


class testSource extends Readable {
  constructor(options) {
    options.objectMode = true;
    super(options);

    this.messages = getTestMessages();
  }

  _read() {
    const thisMessage = this.messages.shift();
    if (thisMessage) {
      console.log(`testSource - READ ${thisMessage.correlationId}`);
      this.push(thisMessage);
    } else {
      console.log("testSource - READ End");
      this.push(null);
    }
  }

  success(message) {
    console.log(`testSource - success ${message.correlationId}`);
  }
  retry(message) {
    console.log(`testSource - retry ${message.correlationId}`);
  }
  fail(message) {
    console.log(`testSource - fail ${message.correlationId}`);
  }
}


module.exports = testSource;
