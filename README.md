# rtc-switchboard

This is an rtc.io signaller that makes use of the excellent realtime
abstraction library, [primus](https://github.com/primus/primus).


[![NPM](https://nodei.co/npm/rtc-switchboard.png)](https://nodei.co/npm/rtc-switchboard/)

[![Build Status](https://travis-ci.org/rtc-io/rtc-switchboard.png?branch=master)](https://travis-ci.org/rtc-io/rtc-switchboard)
[![unstable](http://hughsk.github.io/stability-badges/dist/unstable.svg)](http://github.com/hughsk/stability-badges)

## Usage

To create an application using primus signalling, see the following
examples:

```js
var server = require('http').createServer();
var signaller = require('rtc-switchboard')(server);
var port = parseInt(process.env.SERVER_PORT || process.argv[2], 10) || 3000;

// start the server
server.listen(port, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running on port: ' + port);
});
```

## Reference

### switchboard(server, opts?)

Create the switchboard which uses primus under the hood. By default calling
this function will create a new `Primus` instance and use the
pure [websockets adapter](https://github.com/primus/primus#websockets).

That behaviour can be overriden, however, by providing a prepared primus
instance in `opts.primus`, e.g:

```js
var server = require('http').createServer();
var Primus = require('primus');

// create the signaller, providing our own primus instance (using engine.io)
var signaller = require('rtc-switchboard')(server, {
  primus: new Primus(server, { transformer: 'engine.io' })
});

// start the server
server.listen(3000);
```

You can also provide different command handlers via opts also:

```
ERROR: could not find: 
```

### ConnectionManager(primus, opts)

The `ConnectionManager` is used to route messages from one peer to another.
When a peer announces itself to the signalling server, if it has specified
a room, then general messages will only be routed to other peers in the
same room.

An exeption to this case is `/to` messages which are routed directly to
the specified peer.

#### connect(spark)

Return a [through](https://github.com/dominictarr/through) stream for the
spark that we can pipe the incoming data from the spark into to be handled
correctly.

#### createSocket(url)

Create a websocket client connection the underlying primus server.

#### joinRoom(name, spark)

Join the room specified by `name`.

### Room(name)

This is a simple helper class for encapsulating room details.

#### leave(spark)

Remove the specified spark from the room

#### write(message, source)

Write `message` to all the sparks in the room, with the exception of the
`source` spark.

## Custom Message Handlers

The socket server is configured to handle some specific rtc.io signaller
messages.  The handlers are stored in the `handlers/` folder of the
repository and have details outlined below.

### announce handler

Will handle `/announce` messages and associate the peer id assigned by
the client-side signaller with the socket on the server side.

This will allow routing of messages to the correct receipient when
`/to` messages are received.

## License(s)

### Apache 2.0

Copyright 2013 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
