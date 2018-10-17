# Service Host

This package contains a service host implementation. You can host any number of arbitory services inside the host.
The host pulls data from a source (for example AWS SQS) and routes those messages to one of the configured handlers.

Messages coming out of the source must have a certain shape so that the host can route the message to the correct service.
If the message does not conform to the correct shape it will be sent as is to the first service registered.

There is logging built in along with a heartbeat that can be used to monitor the status of the service host.


## Usage

An example usage is given in the Example folder which uses the test source to get its messages. The host works best when passed
messages in the following format although will work with any message format. It's just that the routing will be ignored and the messages
will be routed to the first available handler.

```json
{
  "name": "",
  "version": 0,
  "correlationId": "00000000-0000-0000-0000-000000000000",
  "payload": ""
}
```

When it is used the service host needs to be given a handler, this handler needs to be a function that takes as arguments
a message, and a collection of callbacks that give control to the handler on what to do with the message once all is done.
success (delete the message), retry (do nothing with the message), or fail (treat the message to an error),

These callbacks are all relative to a source. For example an aws sqs source will need to delete messages from the sqs queue
and an azure source would need to delete messages from azure. The source knows how to deal with messages originating from that source.

For an example of setting up a handler see the registerHandlers method in example/service.js


## Config - Defaults defined in the [brackets]
```
export serviceHostLoggerLevel=info                      # [silent] fatal error warn info debug trace
export serviceHostMaxProcessingConcurrency=2            # [1]
export serviceHostSource=test                           # [aws] test cron
export serviceHostMaxNumberOfMessagesToReadInBatch=5    # [10]
export serviceHostMillisecondsToWaitOnError=1000        # [10000]          // 10 seconds by default
export serviceHostMillisecondsToWaitOnNoMessages=1000   # [10000]          // 10 seconds by default
export serviceHostWaitTimeSecondsWhilstReading=0        # [20]             // long polling by default
export serviceHostHeartbeatCronExpression="* * * * * *" # [*/30 * * * * *] // 30 seconds by default
export serviceHostHeartbeatDestination=sns              # [logging] sqs sns
export serviceHostHeartbeatDestinationParameters="{\"targetSnsArn\": \"arn:aws:sns...\"}" # [{}] // should be a JSON string
export serviceHostQueueUrl=https://sqs.eu-west-1.amazonaws.com/123456789/myQueueName
export serviceHostErrorArn=arn:aws:sns:eu-west-1:123456789012:mySNSName

export AWS_SECRET_ACCESS_KEY=AAAAAAABBBBBBB
export AWS_ACCESS_KEY_ID=CCCCCCCDDDDDDD
export AWS_REGION="eu-west-1"
```

It is possible to pass the config into the serviceHost when it is instantiated example/server.js shows how this works for a couple of the config values.


## Example
### Installation
Of course in order to run the example you first need to clone the repo, then run npm install. I would then run the tests to ensure its all
working correctly before trying to execute the example.
```
git clone https://github.com/DamianStanger/serviceHost.git
npm install
npm test
```

### Execution
To run a simulated full stack test with a fixed set of messages from a test source run:
```
export serviceHostLoggerLevel=info
npm start                            # Run the example server with pretty printed logs
```
This will send a number of messages into the serviceHost with a simulated 2 second piece of work inside the handler. At the same time
the heartbeat will run every 30 seconds logging to the console.

### Example running against AWS as the source
To run the example service plugged into the real AWS SQS source just run the following config exports:
```
export serviceHostLoggerLevel=debug
export serviceHostSource=aws
export serviceHostQueueUrl=https://sqs.eu-west-1.amazonaws.com/123456789/readMessagesFromThisSQS
export serviceHostErrorArn=arn:aws:sns:eu-west-1:123456789012:sendMyErrorsToThisSNS
```

To hook up the heartbeat to an AWS queue set the following environment variables:
```
export serviceHostHeartbeatDestination=sqs
export serviceHostHeartbeatDestinationParameters="{\"targetSqsUrl\": \"https://sqs.eu-west-1.amazonaws.com/123456789/myQueueName\"}"
```
Then start the example as normal
```
npm start
```

Now any messages dropped on to the configured queue will be read and processed by the example service which just has the effect of logging the
messages and acknowledging them (deleting) from the source queue. Remember for best results to use the message structure in the usage section
above.

Also see the APPENDIX on how to set up your queue, there is a gotcha in there.


### Example running on a cron job
TODO

## Heartbeat
There is a built in heartbeat that will by default log to the console every 30 seconds. This is configurable in that
you can change the frequency of the heartbeat and also the destination that the heartbeat will send to; log, sns or sqs.
### CRON
A string consisting of 6 values, representing (seconds, minutes, hours, day of month, month, day of week)
Examples:
```
"* * * * * *"      - run every second of every minute/hour/day/month
"*/30 * * * * *"   - run every 30 seconds
"1 * * * * *"      - run on the first second of every minute
"0 0 0 * * *"      - run at midnight every day
"0 0 0 * * 1-5"    - run at midnight monday to friday
```

### Destination
There are 3 destination types depending on how you want the heartbeat to be processed. All the destinations take a message and a
subject and proceed to process the message accordingly.
#### Logging destination [logging]
This destination just takes the message and subject and logs it.
It does not take any parameters in the serviceHostHeartbeatDestinationParameters env variable
#### SQS destination [sqs]
Use this to send the messages directly to a configured aws sqs queue.
The serviceHostHeartbeatDestinationParameters env variable must contain the SQS URL thus:
```
{"targetSqsUrl": "https://sqs.eu-west-1.amazonaws.com/123456789/myQueueName"}
```

#### SNS destination [sns]
Use this to publish the messages to a configured aws sns topic.
The serviceHostHeartbeatDestinationParameters env variable must contain the SQS URL thus:
```
{"targetSnsArn": "https://sqs.eu-west-1.amazonaws.com/123456789/myQueueName"}
```


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
* Ensure all failures are handled
* Incremental backoff when consecutive errors occur
* Logging of the system resources

### Outstanding tasks
* Finish healthcheck, send to sqs, sns
* Add demo for use of the cron source

### Future features
#### Health check messages
Extend the heartbeat to also report on the health of the system. Things like cpu and memory stats, throughput, last message id.
We could even have tallys of the different message events, counts and the like.
Are there any other stats that would be pertiant to aid in the running/monitoring of the system


## Limitations of the service host package
### Read stream concurrency
Currently only one call to the source can be in progress at any one time. so if you have a slow network connection to sqs,
the rate of messages into the pipe will be limited by the rate at which a single connection to sqs can deliver messages. Setting
the high watermark on the read stream will not make any difference as the logic inside the readstream enforces one at a time
logic to the source.

Im thinking on how this can best be overcome. Right now we host our services on EC2 instances and
the service logic is slower than the time it takes to read messages off the sqs queue, therfore it is not an issue for us at this moment.


# APPENDIX
## AWS CLI
To run the example and use this code linked up to AWS you first need to set the following environment variables so that
the AWS packages can connect to the AWS services

```
export AWS_REGION="eu-west-1"
export AWS_ACCESS_KEY_ID="ABCDEFG12345678"
export AWS_SECRET_ACCESS_KEY="myS3crEtAcc355KeY4AwS"
```

## Setting up SQS queues
### Source Queue
Whats the name of that checkbox
what are the other recommended settings for the queue
Remember to set the queue permissions
Set the retry policy

### Dead letter queue (DLQ)
Hook this up to the main source queue via the redrive policy

### Error queue linked to the error SNS


## Windows/ Linux and WSL
I developed this package on a windows machine running WSL (windows subsystem for linux) which gives me native ubuntu in the
console. There is no reason why this wont work on other environments but as you may have noticed there are certain commands
in this readme that are more tailored to a linux terminal.
If you are doing your dev on a windows machine please try out the WSL its excellent and gives a great developer experiance
whilst integrating really well in to the windows operating system.


# Further reading / integration
* Run the example service pointing the heartbeat to sqs
* Clone and run the heartbeat processing service (to be built)
* Clone and run the heartbeat API (again, yet to be built)
* Clone and run the heartbeat angular SPA (erm... yeah, plans)
