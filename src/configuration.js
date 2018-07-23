/* eslint-disable no-process-env */
const path = require("path");
const logger = require("./logger")("serviceHost.configuration");


function getConfiguration(config = {}) {

  const readHighWaterMark = config.readHighWaterMark || process.env.serviceHostReadHighWaterMark || 10;
  const maxConcurrency = config.maxConcurrency || process.env.serviceHostMaxConcurrency || 1;
  const configuration = {
    "readHighWaterMark": parseInt(readHighWaterMark, 10),
    "maxConcurrency": parseInt(maxConcurrency, 10)
  };

  function getSource() {
    if (config.source && typeof (config.source) === "object") {
      return config.source;
    }

    let sourceFileName = config.source || process.env.serviceHostSource || "testSource";
    sourceFileName = path.join(process.cwd(), "src", "source", sourceFileName);
    return require(sourceFileName)(configuration);
  }

  configuration.source = getSource();

  logger.debug("Config set to", configuration);

  return configuration;
}


module.exports = getConfiguration;
