/* jshint node: true */
'use strict';

var debug = require('debug')('rtc-switchboard');
var defaults = require('cog/defaults');

/**
  # rtc-switchboard

  This is an rtc.io signalling server (counterpart to
  [rtc-signaller](https://github.com/rtc-io/rtc-signaller)) that makes use of
  the excellent realtime abstraction library,
  [primus](https://github.com/primus/primus). It has been designed and built
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
  npm install
  node server.js
  ```

  If you wish to run the server on a specific port, then set the `NODE_PORT`
  environment variable prior to execution:

  ```
  NODE_PORT=8997 node server.js
  ```

  ## Usage: API

  To create an application using primus signalling, see the following
  examples:

  ### Pure Node HTTP

  <<< server.js

  ### Using Express

  <<< examples/express.js

  ## Including the Primus Client

  The `rtc-switchboard` makes use of the slick WebSockets abstraction library
  [Primus](https://github.com/primus/primus). To work with the server, you
  will need to include the `primus.js` library in your application prior to
  attempting a websocket connection.

  If you are working with a local standalone server, the following script
  tag will likely do the job:

  ```html
  <script src="http://localhost:3000/rtc.io/primus.js"></script>
  ```

  __NOTE:__ A specific call to include primus is not required if you are
  working with particular rtc.io library (such as
  [rtc-glue](https://github.com/rtc-io/rtc-glue)), as they will ensure the
  primus library has been included prior to running their internal code.

  ## Usage: Docker

  If you are interested in deploying an instance of `rtc-switchboard` using
  [docker](https://www.docker.com/) then the following is a great place to
  start:

  <https://github.com/synctree/docker-rtc-switchboard>

  ## Writing Custom Command Handlers

  When you initialize the switchboard, you are able to provide custom handlers
  for specific commands that you want handled by the switchboard. Imagine
  for instance, that we want our switchboard to do something clever when a
  client sends an `/img` command.

  We would create our server to include the custom `img` command handler:

  <<< examples/custom-handlers.js

  And then we would write a small module for the handler:

  <<< examples/handlers/img.js

  ## Reference

**/

/**
  ### switchboard(server, opts?)

  Create the switchboard which uses primus under the hood. By default calling
  this function will create a new `Primus` instance and use the
  pure [websockets adapter](https://github.com/primus/primus#websockets).

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
