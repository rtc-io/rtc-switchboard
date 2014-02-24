/* jshint node: true */
'use strict';

var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('rtc-switchboard');
var util = require('util');

/**
  ### Room(name)

  This is a simple helper class for encapsulating room details.

**/
function Room(name) {
  if (! (this instanceof Room)) {
    return new Room(name);
  }

  EventEmitter.call(this);

  this.name = name;
  this.sparks = [];
}

util.inherits(Room, EventEmitter);
module.exports = Room;

/**
  #### leave(spark)

  Remove the specified spark from the room
**/
Room.prototype.leave = function(spark) {
  var idx = this.sparks.indexOf(spark);
  var srcId = spark.metadata && spark.metadata.id;
  var room = this;

  if (idx >= 0) {
    this.sparks.splice(idx, 1);

    // send a leave message to all the other peers
    this.sparks.forEach(function(peerSpark) {
      var agent = peerSpark.metadata && peerSpark.metadata.agent;

      // if we have an agent specified we are using the new
      // version of the signaller so use two || as the header
      // TODO: clean up this is hacky
      var messageHeader = agent ?
        '/leave|{"id":"' + srcId + '"}|' :
        '/leave|';

      if (srcId) {
        peerSpark.write(messageHeader + JSON.stringify({ id: srcId }));
      }
    });

    // if we have no remaining sparks destroy the room
    if (this.sparks.length === 0) {
      this.emit('destroy');
    }
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