/* eslint-disable no-process-env,no-console */

const path = require("path");


function getConfiguration(config = {}) {

  const readHighWaterMark = config.readHighWaterMark || process.env.readHighWaterMark || 10;
  const maxConcurrency = config.maxConcurrency || process.env.maxConcurrency || 1;
  let sourceFileName = config.source || process.env.source || "testSource";
  sourceFileName = `.${path.sep}source${path.sep}${sourceFileName}`;

  const configuration = {
    "readHighWaterMark": parseInt(readHighWaterMark, 10),
    "maxConcurrency": parseInt(maxConcurrency, 10),
    sourceFileName
  };

  console.log("configuration - config set to", configuration);

  const source = require(configuration.sourceFileName)(configuration);
  configuration.source = source;

  return configuration;
}


module.exports = getConfiguration;
