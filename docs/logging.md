## Logging and Analytics using the `data` event

Every message that flows through the switchboard (whether handled or not) can be logged through tapping into the `data` event.  The example below demonstrates how this can be done with a node logging module like [bunyan](https://github.com/trentm/node-bunyan):

<<< examples/simple-logging.js

As can be seen in the example above, the handlers of the `data` event can expect to receive three arguments to the handler function, as per the code snippet below:

```js
switchboard.on('data', function(data, peerId, spark) {
});
```

The `data` is the raw data of that has been sent from the client, the `peerId` is the id of the peer sending the data (this will be `undefined` if it is a message received prior to an `/announce` command).
