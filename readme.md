# Service Host

This package contains a service host implementation where in you can host any number of arbitory services inside the host.
The host pulls data from a source (for example AWS SQS) and sends those messages to one of the configured services.

Messages coming out of the source must have a certain shape so that the host can route the message to the correct service.
If the message does not conform to the presquibed shape it will be sent as is to the first service registerd as long as
the --strict flag is set to false.

```json
{
  "name": "",
  "version": 0,
  "correlationId": "00000000-0000-0000-0000-000000000000",
  "payload": ""
}
```

When configuring the service host needs to be given a handler, this handler needs to be a function that takes as arguments
the message, and a collection of callbacks that give control to the handler on whta to do with the message once all is done.
success (delete the message), retry (do nothing with the message), or fail (treat the message to an error).

## Example
to run a simulated full stack test with a fixed set of messages from a testSource run:
```
node example/server.js
```
This will send 10 messages into the serviceHost simulating a 2 second piece of work inside the handler

## Tests
To run all the mocha tests
```
npm test
node_modules/mocha/bin/mocha -u tdd

npm run istsnbul
./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- --ui tdd

npm run nyc
./node_modules/nyc/bin/nyc.js ./node_modules/mocha/bin/mocha --ui tdd
```
