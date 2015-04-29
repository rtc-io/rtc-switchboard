/* jshint node: true */
'use strict';

var debug = require('debug')('rtc-switchboard');

/**
  # rtc-switchboard

  This is an rtc.io signalling server (counterpart to
  [rtc-signaller](https://github.com/rtc-io/rtc-signaller)) uses websockets to
  communicate with signalling clients. It has been designed and built
  primarily as a _reference implementation_ for a signalling server and is
  not designed to be deployed at scale.

  ## Try it out

  If you would like to our test signalling server (no uptime guaranteed) then
  you can use [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect)
  and take it for a spin:

  <<< examples/try-switchboard.js

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

  <<< server.js

  ### Using Express

  <<< examples/express.js

  ## Usage: Docker

  If you are interested in deploying an instance of `rtc-switchboard` using
  [docker](https://www.docker.com/) then the following is a great place to
  start:

  <https://github.com/synctree/docker-rtc-switchboard>

  <<< docs/logging.md

**/

module.exports = function(server, opts) {
  var WebSocketServer = require('ws').Server;
  var wss = new WebSocketServer({ server: server });
  var board = require('rtc-switch')();
  var connections = [];

  wss.on('connection', function connection(ws) {
    var peer = board.connect();

    // add the socket to the connection list
    connections.push(ws);

    ws.on('message', peer.process);
    peer.on('data', function(data) {
      if (ws.readyState === 1) {
        debug('<== %s %s', peer.id, data);
        ws.send(data);
      }
    });

    ws.on('close', function() {
      // trigger the peer leave
      peer.leave();

      // splice out the connection
      connections = connections.filter(function(conn) {
        return conn !== ws;
      });
    });
  });

  // add a reset helper
  board.reset = function() {
    connections.splice(0).forEach(function(conn) {
      conn.close();
    });
  };

  return board;
};
