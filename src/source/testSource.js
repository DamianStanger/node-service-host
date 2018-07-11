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
    messageBuilder().withVersion(undefined).withEventName(undefined).build(),
    messageBuilder().withVersion(undefined).withEventName(undefined).withPayload(undefined).build(),
    messageBuilder().withVersion(undefined).withEventName(undefined).withPayload(undefined).withCorrelationId(undefined).build(),
    messageBuilder().withPayload("eyJkYXRhIjoiZm9iYXIifQ==").build(),
    messageBuilder().withVersion(2).build(),
    messageBuilder().withEventName("orderReceived").build(),
    unstructuredMessage,
    messageBuilder().withPayload("eyJkYXRhIjoiZml6ekJ1enoifQ==").build()
  ];
}


const messages = getTestMessages();

const testSource = new Readable({
  "objectMode": true,

  read() {
    const thisMessage = messages.shift();
    if (thisMessage) {
      console.log(`testSource - READ ${thisMessage.correlationId}`);
      this.push(thisMessage);
    } else {
      console.log("testSource - READ End");
      this.push(null);
    }
  }
});

testSource.success = message => {
  console.log(`testSource - success ${message.correlationId}`);
  return Promise.resolve();
};

testSource.retry = message => {
  console.log(`testSource - retry ${message.correlationId}`);
  return Promise.resolve();
};

testSource.fail = message => {
  console.log(`testSource - fail ${message.correlationId}`);
  return Promise.resolve();
};


module.exports = testSource;
