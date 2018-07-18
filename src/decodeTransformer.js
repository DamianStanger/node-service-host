const _ = require("lodash");
const {Transform} = require("stream");
const logger = require("./logger")("decodeTransformer");
const base64Decode = require("./base64Decode");


function decodeTransformer() {
  const transformer = new Transform({
    "objectMode": true,
    "highWaterMark": 1,

    transform(message, encoding, next) {
      const transformedMessage = _.cloneDeep(message);
      if (transformedMessage.payload && typeof transformedMessage.payload === "string") {
        logger.trace(`${message.correlationId} transforming payload:${transformedMessage.payload.substr(0, 10)}...`);

        transformedMessage.payload = base64Decode(transformedMessage.payload, message.correlationId);

        logger.trace(`${message.correlationId} transformed payload to:${JSON.stringify(transformedMessage.payload).substr(0, 10)}...`);
      }
      this.push(transformedMessage);
      next();
    }
  });

  return transformer;
}


module.exports = decodeTransformer;
