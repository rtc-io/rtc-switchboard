/* jshint node: true */
'use strict';

var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('rtc-switchboard');
var FastSet = require('collections/fast-set');
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

  // initialise the peer lookups
  this.sparks = new FastSet();

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

  function write(data, target) {
    var command;
    var handler;
    var payload = data;
    var preventSend = false;
    var parts;

    // if we have string data then preprocess
    if (typeof data == 'string' || (data instanceof String)) {
      if (data.charAt(0) === '/') {
        // initialise the command name
        command = data.slice(1, data.indexOf('|', 1)).toLowerCase();

        // get the payload
        payload = data.slice(command.length + 2);

        // if we have a to command, then handle
        if (command === 'to') {
          // get the target id
          parts = payload.split('|');

          // write the data out to the target spark
          return write(parts.slice(1), mgr.sparks[parts[0]]);
        }

        // try and parse the payload as JSON
        try {
          payload = JSON.parse(payload);
        }
        catch (e) {
          // not json
        }
      }
    }
    // TODO: handle non-string data
    else {
      return;
    }

    // check if we have a handler for the current command
    handler = command && handlers[command];

    // if we have a handler, the invoke
    if (typeof handler == 'function') {
      preventSend = !!handler(mgr, spark, data, payload);
    }

    // debug('got message: ' + data + ', command: ' + command + ', prevent send: ' + preventSend, payload);

    // trigger a command event
    if (command) {
      mgr.emit(command, payload);
    }

    // if we are preventing send, then return
    if (preventSend) {
      return;
    }

    if (target) {
      debug('/to ' + target.peerId + ', data: ' + data);
      target.write(data);
    }
    else {
      spark.scope.write(data, spark);
    }
  }

  function end() {
    debug('spark ended, disconnecting');

    // send a leave message to connected sparks
    if (spark.peerId) {
      mgr.sparks.delete(spark.peerId);
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