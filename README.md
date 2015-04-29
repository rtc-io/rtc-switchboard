# rtc-switchboard

This is an rtc.io signalling server (counterpart to
[rtc-signaller](https://github.com/rtc-io/rtc-signaller)) uses websockets to
communicate with signalling clients. It has been designed and built
primarily as a _reference implementation_ for a signalling server and is
not designed to be deployed at scale.


[![NPM](https://nodei.co/npm/rtc-switchboard.png)](https://nodei.co/npm/rtc-switchboard/)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable) [![Build Status](https://api.travis-ci.org/rtc-io/rtc-switchboard.svg?branch=master)](https://travis-ci.org/rtc-io/rtc-switchboard) [![bitHound Score](https://www.bithound.io/github/rtc-io/rtc-switchboard/badges/score.svg)](https://www.bithound.io/github/rtc-io/rtc-switchboard) 

## Try it out

If you would like to our test signalling server (no uptime guaranteed) then
you can use [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect)
and take it for a spin:

```js
var quickconnect = require('rtc-quickconnect');

quickconnect('//switchboard.rtc.io/', { room: 'switchboard-test' })
  .createDataChannel('test')
  .once('channel:opened:test', function(peerId, dc) {
    dc.onmessage = function(evt) {
      console.log('received data: ', evt.data);
    };

    dc.send('hello');
  });

```

Other examples are available in the [guidebook](http://guidebook.rtc.io)

## Usage: Standalone

If you wish to use `rtc-switchboard` on it's own to test signalling,
then you can simply clone this repository, install dependencies and start
the server:

```
git clone https://github.com/rtc-io/rtc-switchboard.git
cd rtc-switchboard
npm install && npm start
```

If you wish to run the server on a specific port, then set the `NODE_PORT`
environment variable prior to execution:

```
NODE_PORT=8997 node server.js
```

## Usage: API

To create an application using switchboard signalling, see the following
examples:

### Pure Node HTTP

```js
var server = require('http').createServer();
var switchboard = require('rtc-switchboard/')(server, { servelib: true });
var port = parseInt(process.env.NODE_PORT || process.env.PORT || process.argv[2], 10) || 3000;
var replify = require('replify');

server.on('request', function(req, res) {
  if (req.url === '/') {
    res.writeHead(302, {
      'Location': 'https://github.com/rtc-io/rtc-switchboard'
    });
    res.end('switchboard available from: https://github.com/rtc-io/rtc-switchboard');
  }
});

// start the server
server.listen(port, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running at http://localhost:' + port + '/');
});

// add the repl
replify({
  name: 'switchboard',
  app: switchboard,
  contexts: {
    server: server
  }
});

switchboard.on('room:create', function(room) {
  console.log('room ' + room + ' created, now have ' + switchboard.rooms.length + ' active rooms');
});

switchboard.on('room:destroy', function(room) {
  console.log('room ' + room + ' destroyed, ' + switchboard.rooms.length + ' active rooms remain');

  if (typeof gc == 'function') {
    console.log('gc');
    gc();
  }
});


```

### Using Express

```js
var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;

// create the switchboard
var switchboard = require('rtc-switchboard')(server);

server.listen(port, function(err) {
  if (err) {
    return;
  }

  console.log('server listening on port: ' + port);
});

```

## Usage: Docker

If you are interested in deploying an instance of `rtc-switchboard` using
[docker](https://www.docker.com/) then the following is a great place to
start:

<https://github.com/synctree/docker-rtc-switchboard>

## Logging and Analytics using the `data` event

Every message that flows through the switchboard (whether handled or not) can be logged through tapping into the `data` event.  The example below demonstrates how this can be done with a node logging module like [bunyan](https://github.com/trentm/node-bunyan):

```js
var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;
var bunyan = require('bunyan');
var log = bunyan.createLogger({ name: 'rtc-switchboard' });

// create the switchboard
var switchboard = require('rtc-switchboard')(server);

server.listen(port, function(err) {
  if (err) {
    return;
  }

  console.log('server running at: http://localhost:' + port + '/');
});

switchboard.on('data', function(data, peerId, spark) {
  log.info({ peer: peerId }, 'received: ' + data);
});

```

As can be seen in the example above, the handlers of the `data` event can expect to receive three arguments to the handler function, as per the code snippet below:

```js
switchboard.on('data', function(data, peerId, spark) {
});
```

The `data` is the raw data of that has been sent from the client, the `peerId` is the id of the peer sending the data (this will be `undefined` if it is a message received prior to an `/announce` command).


## License(s)

### Apache 2.0

Copyright 2015 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
