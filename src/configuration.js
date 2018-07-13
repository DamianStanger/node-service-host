/* eslint-disable no-process-env */
const path = require("path");
const logger = require("./logger")("serviceHost.configuration");


function getConfiguration(config = {}) {

  const readHighWaterMark = config.readHighWaterMark || process.env.readHighWaterMark || 10;
  const maxConcurrency = config.maxConcurrency || process.env.maxConcurrency || 1;
  let sourceFileName = config.source || process.env.source || "testSource";
  // sourceFileName = `.${path.sep}source${path.sep}${sourceFileName}`;
  sourceFileName = path.join(process.cwd(), "src", "source", sourceFileName);

  const configuration = {
    "readHighWaterMark": parseInt(readHighWaterMark, 10),
    "maxConcurrency": parseInt(maxConcurrency, 10),
    sourceFileName
  };

  logger.info("Config set to", configuration);

  const source = require(configuration.sourceFileName)(configuration);
  configuration.source = source;

  return configuration;
}


module.exports = getConfiguration;
