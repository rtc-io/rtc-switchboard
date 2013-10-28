/* jshint node: true */
'use strict';

var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('rtc-switchboard');
var through = require('through');
var Room = require('./room');
var util = require('util');

var baseHandlers = {
  announce: require('./handlers/announce')
};

function ConnectionManager(primus, opts) {
  var handlers;

  if (! (this instanceof ConnectionManager)) {
    return new ConnectionManager();
  }

  // inherited
  EventEmitter.call(this);

  // save a reference to primus
  this.primus = primus;

  // create a rooms container
  this.rooms = {};

  // initialise the handlers
  handlers = this.handlers = (opts || {}).handlers || {};

  // add the base handlers if not specifically defined
  Object.keys(baseHandlers).forEach(function(name) {
    if (! handlers[name]) {
      handlers[name] = baseHandlers[name];
    }
  });
}

util.inherits(ConnectionManager, EventEmitter);
module.exports = ConnectionManager;

ConnectionManager.prototype.connect = function(spark) {
  var handlers = this.handlers;
  var mgr = this;

  // initialise the spark scope to primus
  spark.scope = this.primus;

  function write(data) {
    var command;
    var handler;
    var payload = data;
    var preventBroadcast = false;

    // if we have string data then preprocess
    if (typeof data == 'string' || (data instanceof String)) {
      if (data.charAt(0) === '/') {
        // initialise the command name
        command = data.slice(1, data.indexOf('|', 1));

        // get the payload
        payload = data.slice(command.length + 2);

        // try and parse the payload as JSON
        try {
          payload = JSON.parse(payload);
        }
        catch (e) {
          // not json
        }
      }
    }
    // if we have an object, then primus is being helpful :)
    else if (typeof data == 'object') {
      command = data.command;
    };

    // check if we have a handler for the current command
    handler = command && handlers[command];

    // if we have a handler, the invoke
    if (typeof handler == 'function') {
      preventBroadcast = !!handler(mgr, spark, data, payload);
    }

    debug('got message: ' + data + ', command: ' + command + ', prevent broadcast: ' + preventBroadcast);

    // trigger a command event
    if (command) {
      mgr.emit(command, payload);
    }

    // if the message has not been handled, then
    // otherwise, just broadcast
    if (! preventBroadcast) {
      spark.scope.write(data, spark);
    }
  }

  function end() {
    debug('spark ended, disconnecting');

    // send a leave message to connected sparks
    if (spark.peerId) {
      spark.scope.write('/leave|' + spark.peerId, spark);
    }

    // invoke the leave action if part of a room
    if (spark.scope && typeof spark.scope.leave == 'function') {
      spark.scope.leave(spark);
    }
  }

  debug('spark connecting');
  return through(write, end);
};

/**
  #### createSocket(url)

  Create a websocket client connection the underlying primus server.
**/
ConnectionManager.prototype.createSocket = function(url) {
  return new this.primus.Socket(url);
};

ConnectionManager.prototype.joinRoom = function(name, spark) {
  var room = this.rooms[name];

  // if we don't have a room, then create one
  if (! room) {
    room = this.rooms[name] = new Room(name);
  }

  // add the current spark to the room
  room.sparks.push(spark);

  // return the room
  return room;
};