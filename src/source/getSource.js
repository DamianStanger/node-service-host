const path = require("path");


function getSource(config) {
  if (config.source && typeof (config.source) === "object") {
    return config.source;
  }

  const sourceFileName = path.join(process.cwd(), "src", "source", config.source, "source");
  return require(sourceFileName)(config);
}


module.exports = getSource;
