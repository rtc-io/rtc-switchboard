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

  if (idx >= 0) {
    this.sparks.splice(idx, 1);
  }
};

/**
  #### write(message, source)

  Write `message` to all the sparks in the room, with the exception of the
  `source` spark.
**/
Room.prototype.write = function(message, source) {
  this.sparks.forEach(function(spark) {
    if (spark !== source) {
      debug('writing message to spark: ' + spark.peerId, message);
      spark.write(message);
    }
  });
};