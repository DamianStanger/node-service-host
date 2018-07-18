# Service Host

This package contains a service host implementation where in you can host any number of arbitory services inside the host.
The host pulls data from a source (for example AWS SQS) and sends those messages to one of the configured services handlers.

Messages coming out of the source must have a certain shape so that the host can route the message to the correct service.
If the message does not conform to the presquibed shape it will be sent as is to the first service registerd as long as
the --strict flag is set to false.

## Usage

An example usage is given in the Example folder which uses the testSource to get its messages. The host works best when passed
messages in the following format although will work with any message format. its just that the routing will be ignored.

```json
{
  "name": "",
  "version": 0,
  "correlationId": "00000000-0000-0000-0000-000000000000",
  "payload": ""
}
```

When configuring, the service host needs to be given a handler, this handler needs to be a function that takes as arguments
a message, and a collection of callbacks that give control to the handler on what to do with the message once all is done.
success (delete the message), retry (do nothing with the message), or fail (treat the message to an error).

These callbacks are all relative to a source. For example an aws sqs source will need to delete messages from the sqs queue
and an azure source would need to delete messages from azure. The source knows how to deal with messages from that source.

## Config
export LOGGER_LEVEL=info   # [silent] fatal error warn info debug trace
export LOGGER_NAME=myApp   # [undefined]
export maxConcurrency=2     # [1]
export readHighWaterMark=5  # [10]
export source=testSource    # [testSource]

## Example
to run a simulated full stack test with a fixed set of messages from a testSource run:
```
npm run example
npm run example | node_modules/pino/bin.js   # will pretty print the pino logs
node example/server.js
```
This will send 10 messages into the serviceHost simulating a 2 second piece of work inside the handler

## Tests
To run all the mocha tests
```
npm test
node_modules/mocha/bin/mocha -u tdd --recursive

npm run istsnbul
./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- --ui tdd --recursive

npm run nyc
./node_modules/nyc/bin/nyc.js ./node_modules/mocha/bin/mocha --ui tdd --recursive
```

## eslint
This package follows the eslint rules and can be checked with and automatically fixed with
```
npm run eslint
node_modules/eslint/bin/eslint.js src/**/*.js test/**/*.js example/**/*.js
npm run eslint-fix
node_modules/eslint/bin/eslint.js src/**/*.js test/**/*.js example/**/*.js --fix
```

## Roadmap
* Include all source files in the code coverage report
* catch all handler if no version was defined in the registration
* AWS source
* Delete AWS messages on success
* Send message with failure reason to SNS
* Injectable messages for testing
* End to end tests using the injectable messages
* Handle failures better
