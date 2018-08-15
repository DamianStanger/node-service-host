# Service Host

This package contains a service host implementation where in you can host any number of arbitory services inside the host.
The host pulls data from a source (for example AWS SQS) and sends those messages to one of the configured services handlers.

Messages coming out of the source must have a certain shape so that the host can route the message to the correct service.
If the message does not conform to the correct shape it will be sent as is to the first service registered.


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


## Config - Defaults defined in the brackets []
```
export serviceHostLoggerLevel=info                    # [silent] fatal error warn info debug trace
export serviceHostLoggerName=myApp                    # [undefined]
export serviceHostMaxProcessingConcurrency=2          # [1]
export serviceHostSource=testSource                   # [awsSqsSource]
export serviceHostMaxNumberOfMessagesToReadInBatch=5  # [10]
export serviceHostMillisecondsToWaitOnError=1000      # [10000] // 10 seconds by default
export serviceHostMillisecondsToWaitOnNoMessages=1000 # [10000] // 10 seconds by default
export serviceHostWaitTimeSecondsWhilstReading=0      # [20]    // long polling by default
export serviceHostQueueUrl=https://sqs.eu-west-1.amazonaws.com/123456789/myQueueName

export AWS_SECRET_ACCESS_KEY=AAAAAAABBBBBBB
export AWS_ACCESS_KEY_ID=CCCCCCCDDDDDDD
export AWS_REGION="eu-west-1"
```

It is possible to pass the serviceHost... config into the serviceHost when it is instantiated example/server.js shows how this works.


## Example
To run a simulated full stack test with a fixed set of messages from a testSource run:
```
export serviceHostLoggerLevel=trace                 # [silent] fatal error warn info debug trace
export serviceHostSource=testSource

npm start                                           # Run the example server with pretty printed logs
node example/server.js                              # Get the raw logs to the console
node example/server.js | node_modules/pino/bin.js   # Will pretty print the pino logs
```
This will send a number of messages into the serviceHost with a simulated 2 second piece of work inside the handler.

To run the example service plugged into the real awsSqsSource just run ```npm start``` with no env config. The
default source is the awsSqsSource.


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


## Debug
To debug the app you can run the following (below) which will start the process and
break on the first line which then allows you to attach your favorite debugger.
```
npm run debug
node --inspect-brk example/server.js
```

To debug the tests you can run
```

```

## Roadmap
* Catch all handler if no version was defined in the registration
* Send message with failure reason to SNS
* Ensure all failures are handled
* Stop the streams when the end is reached (throttle)
* Incremental backoff when consecutive errors occur


### Future features
#### Cron job source
This would send an event into the system based on a cron cycle. Basically i see this as another source, a read stream which
when is read from will respond with the nothing to do messages until a given time.
Question: how accurate would we want this to be? if we wanted a message every 5 seconds it would need to be super accurate
maybe sending out these nothing to do messages would not be a good idea, rather do nothing until the time needed
#### Health check messages
How can we get this into the normal source. maybe a transformer stream that also injects extra messages into the pipe?
would this be on a every 10 messages you send a healthcheck type of thing, or every 60 seconds? also send on this message
statistics about the throughput in the last minute.
Send this message to a writer (in the first place console, but also SNS, allow it to be configurable). I see this as a
handler that is always present and is setup to handle the control messages.


## Limitations
### Read stream concurrency
Currently only one call to the source can be in progress at any one time. so if you have a slow network connection to sqs say
the rate of messages into the pipe will be limited by the rate at which a single connection to sqs can deliver messages. Setting
the high watermark on the read stream will not make any difference as the logic inside the readstream enforces one at a time
logic to the source.

Im thinking on how this can best be overcome but right now for my use case where we host the services on EC2 instances and
these services are slower than the time it takes to read messages off the sqs queue it is not an issue for us at this moment.
