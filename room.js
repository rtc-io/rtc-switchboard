/* jshint node: true */
'use strict';

var debug = require('debug')('rtc-switchboard-room');

/**
  ### Room(name)

  This is a simple helper class for encapsulating room details.

**/
function Room(name) {
  if (! (this instanceof Room)) {
    return new Room(name);
  }

  this.name = name;
  this.sparks = [];
}

module.exports = Room;

/**
  #### leave(spark)

  Remove the specified spark from the room
**/
Room.prototype.leave = function(spark) {
  var idx = this.sparks.indexOf(spark);
  var room = this;

  if (idx >= 0) {
    // send a leave message to all the other peers
    (spark.peers || []).forEach(function(peerId) {
      room.write('/leave|' + JSON.stringify({ id: peerId }), spark);
    });

    this.sparks.splice(idx, 1);
  }
};

/**
  #### write(message, source)

  Write `message` to all the sparks in the room, with the exception of the
  `source` spark.
**/
Room.prototype.write = function(message, source) {
  if (this.sparks.length === 0) {
    return debug('no sparks in room, aborting message write');
  }

  debug('writing message to ' + (this.sparks.length - 1) + ' sparks');
  this.sparks.forEach(function(spark) {
    if (spark !== source) {
      debug('writing message to spark: ', message);
      spark.write(message);
    }
  });
};