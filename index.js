/* jshint node: true */
'use strict';

var debug = require('debug')('rtc-signaller-primus');
var Primus = require('primus');
var parser = require('rtc-signaller/parser');
var ConnectionManager = require('./manager');

/**
  # rtc-signaller-primus

  This is an rtc.io signaller that makes use of the excellent realtime
  abstraction library, [primus](https://github.com/primus/primus).

  ## Usage

  To create an application using primus signalling, see the following
  examples:

  <<< server.js

  ## Reference

**/

/**
  ### signaller(server, opts?)

  Create the signaller that will work with primus.  By default calling
  this function will create a new `Primus` instance and use the
  pure [websockets adapter](https://github.com/primus/primus#websockets).

  That behaviour can be overriden, however, by providing a prepared primus
  instance in `opts.primus`, e.g:

  <<< examples/override-primus.js

  You can also provide different command handlers via opts also:

  <<< examples/additional-handlers.js

**/
module.exports = function(server, opts) {
  // create the primus instance
  var primus = (opts || {}).primus || new Primus(server, opts);

  // create the connection manager
  var manager = new ConnectionManager(primus, opts);

  // inject a primus request handler
  server.on('request', function(req, res) {
    if (req.url !== '/rtc.io/primus.js') {
      return;
    }

    res.writeHead(200, {
      'content-type': 'application/javascript'
    });

    res.end(primus.library());
  });

  primus.on('connection', function(spark) {
    spark.pipe(manager.connect(spark));
  });

  return primus;
};