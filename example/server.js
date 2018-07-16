const config = require("./config");
const logger = require("../src/logger")("example.server", "info");
const serviceHost = require("../src/serviceHost")(config);

const registerEvents = require("./service");

registerEvents(serviceHost, config);
serviceHost.start();

logger.warn("Service has been started");
