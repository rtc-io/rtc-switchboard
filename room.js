/* jshint node: true */
'use strict';

function Room(name) {
  if (! (this instanceof Room)) {
    return new Room(name);
  }

  this.name = name;
  this.sparks = [];
}

module.exports = Room;

Room.prototype.leave = function(spark) {
  var idx = this.sparks.indexOf(spark);

  if (idx >= 0) {
    this.sparks.splice(idx, 1);
  }
};

Room.prototype.write = function(message) {
  this.sparks.forEach(function(spark) {
    spark.write(message);
  });
};