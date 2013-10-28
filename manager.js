/* jshint node: true */
'use strict';

var debug = require('debug')('rtc-signaller-primus');
var through = require('through');
var Room = require('./room');

var baseHandlers = {
  announce: require('./handlers/announce')
};

function ConnectionManager(primus, opts) {
  var handlers;

  if (! (this instanceof ConnectionManager)) {
    return new ConnectionManager();
  }

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

module.exports = ConnectionManager;

ConnectionManager.prototype.connect = function(spark) {
  var handlers = this.handlers;
  var mgr = this;

  // initialise the spark scope to primus
  spark.scope = this.primus;

  function write(data) {
    var handler;
    var preventBroadcast = false;

    // if we have string data then preprocess
    if (typeof data == 'string' || (data instanceof String)) {
      if (data.charAt(0) === '/') {
        debug('received command: ' + data.slice(1, data.indexOf('|', 1)));
        handler = handlers[data.slice(1, data.indexOf('|', 1))];
      }
    }

    // if we have a handler, the invoke
    if (typeof handler == 'function') {
      preventBroadcast = !!handler(mgr, spark, data);
    }

    debug('got message: ' + data, preventBroadcast);

    // if the message has not been handled, then
    // otherwise, just broadcast
    if (! preventBroadcast) {
      spark.scope.write(data, spark);
    }
  }

  function end() {
    debug('spark ended, disconnecting');

    // send a leave message to connected sparks
    spark.scope.write('/leave|' + spark.peerId, spark);

    // invoke the leave action if part of a room
    if (spark.scope && typeof spark.scope.leave == 'function') {
      spark.scope.leave(spark);
    }
  }

  return through(write, end);
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