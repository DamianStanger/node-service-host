const assert = require("assert");
const logger = require("../logger")("serviceHost");


function base64Decode(encoded, correlationId) {
  assert(encoded, "Value to be decoded must be a string, empty or otherwise");
  assert.ok(typeof encoded === "string", `Value to be decoded must be a string not a "${typeof encoded}"`);

  const decodedMsg = new Buffer(encoded, "base64").toString("utf8");
  try {
    return JSON.parse(decodedMsg);
  } catch (err) {
    logger.trace(correlationId, `error parsing:${decodedMsg.substr(0, 10)}... to JSON`);
    return encoded;
  }
}


module.exports = base64Decode;
