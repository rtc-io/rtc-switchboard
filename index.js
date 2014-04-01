/* jshint node: true */
'use strict';

var debug = require('debug')('rtc-switchboard');
var defaults = require('cog/defaults');
var Primus = require('primus');
var ConnectionManager = require('./manager');

/**
  # rtc-switchboard

  This is an rtc.io signalling server (counterpart to
  [rtc-signaller](https://github.com/rtc-io/rtc-signaller)) that makes use of
  the excellent realtime abstraction library,
  [primus](https://github.com/primus/primus). It has been designed and built
  primarily as a _reference implementation_ for a signalling server and is
  not designed to be deployed at scale.

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

  If you wish to run the server on a specific port, then set the `SERVER_PORT`
  environment variable prior to execution:

  ```
  SERVER_PORT=8997 node server.js
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

  ## Writing Custom Command Handlers

  When you initialize the switchboard, you are able to provide custom handlers
  for specific commands that you want handled by the switchboard. Imagine
  for instance, that we want our switchboard to do something clever when a
  client sends an `/img` command.

  We would create our server to include the custom `img` command handler:

  <<< examples/custom-handlers.js

  And then we would write a small module for the handler:

  <<< examples/handlers/img.js

  ## Logging and Analytics using the `data` event

  Every message that flows through the switchboard (whether handled or not)
  can be logged through tapping into the `data` event.  The example below
  demonstrates how this can be done with a node logging module like
  [bunyan](https://github.com/trentm/node-bunyan):

  <<< examples/simple-logging.js

  As can be seen in the example above, the handlers of the `data` event can
  expect to receive three arguments to the handler function, as per the code
  snippet below:

  ```js
  switchboard.on('data', function(data, peerId, spark) {
  });
  ```
  
  The `data` is the raw data of that has been sent from the client, the
  `peerId` is the id of the peer sending the data (this will be `undefined` if
  it is a message received prior to an `/announce` command).  Finally we have
  the raw primus `spark` that can be examined for additional information.

  ## Reference

**/

/**
  ### switchboard(server, opts?)

  Create the switchboard which uses primus under the hood. By default calling
  this function will create a new `Primus` instance and use the
  pure [websockets adapter](https://github.com/primus/primus#websockets).

**/
module.exports = function(server, opts) {
  var primus;
  var manager;
  var library;

  // specify opts defaults
  opts = defaults({}, opts, {
    parser: require('./parser-noop')
  });

  // create the primus instance
  primus = (opts || {}).primus || new Primus(server, opts);

  // create the connection manager
  manager = new ConnectionManager(primus, opts);
  library = manager.library();

  if (opts && opts.servelib) {
    server.on('request', function(req, res) {
      if (req.url === '/rtc.io/primus.js') {
        library(req, res);
      }
    });
  }

  primus.on('connection', function(spark) {
    spark.pipe(manager.connect(spark));
  });

  return manager;
};