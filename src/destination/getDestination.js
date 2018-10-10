const path = require("path");


function getDestination(config) {
  if (config.destination && typeof (config.destination) === "object") {
    return config.destination;
  }

  const destinationFileName = path.join(process.cwd(), "src", "destination", config.destination);
  return require(destinationFileName)(config.destinationParameters);
}


module.exports = getDestination;
