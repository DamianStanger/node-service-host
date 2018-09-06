const AWS = require("aws-sdk");
const logger = require("../../logger")("serviceHost.source.aws.snsProxy");


AWS.config.update({"region": "eu-west-1"});
const awsSns = new AWS.SNS({"apiVersion": "2010-03-31"});


function getSnsProxy(configuration, sns = awsSns) {
  function publish(message) {

    const params = {
      "Message": JSON.stringify(message),
      "Subject": "Some subject",
      "TargetArn": configuration.errorSNS
    };

    logger.info(`${message.correlationId} - sending sns message '${params.Subject}'`);

    return sns.publish(params).promise().then(data => {
      logger.debug(message.correlationId, "Message published", data);
      return data;
    }).catch(err => {
      logger.error(message.correlationId, "Error publishing msg");
      logger.error(err);
      throw new Error(err);
    });
  }

  return {publish};
}


module.exports = getSnsProxy;
