/* jshint node: true */
'use strict';

var debug = require('debug')('rtc-signaller-primus');
var Primus = require('primus');
var parser = require('rtc-signaller/parser');

var baseHandlers = {
  announce: require('./handlers/announce')
}

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
    console.log('spark connected');

    spark.on('data', function(data) {
      console.log(parser(data));
    });

    spark.on('end', function() {
      console.log('spark disconnected');
    });
  });

  // // add any additional handlers
  // var handlers = (opts || {}).handlers || {};

  // // add the base handlers if not specifically defined
  // Object.keys(baseHandlers).forEach(function(name) {
  //   if (! handlers[name]) {
  //     handlers[name] = baseHandlers[name];
  //   }
  // });

  // return function(socket) {

  //   function handleMessage(data) {
  //     var handler;
  //     var preventBroadcast = false;

  //     // if we have string data then preprocess
  //     if (typeof data == 'string' || (data instanceof String)) {
  //       if (data.charAt(0) === '/') {
  //         debug('received command: ' + data.slice(1, data.indexOf('|', 1)));
  //         handler = handlers[data.slice(1, data.indexOf('|', 1))];
  //       }
  //     }

  //     // if we have a handler, the invoke
  //     if (typeof handler == 'function') {
  //       preventBroadcast = handler(io, socket, data);
  //     }

  //     debug('got message: ' + data, preventBroadcast);

  //     // if the message has not been handled, then 
  //     // otherwise, just broadcast
  //     if (! preventBroadcast) {
  //       socket.broadcast.send(data);
  //     }
  //   }

  //   function handleDisconnect() {
  //     debug('socket disconnect, peer id: ' + socket.peerId);

  //     if (socket.peerId) {
  //       io.sockets.send('/leave|' + socket.peerId);
  //     }
  //   }

  //   socket.on('message', handleMessage);
  //   socket.on('disconnect', handleDisconnect);
  // };

  return primus;
}; 