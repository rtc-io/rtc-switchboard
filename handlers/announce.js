/* jshint node: true */
'use strict';

/**
  ### announce handler

  Will handle `/announce` messages and associate the peer id assigned by
  the client-side signaller with the socket on the server side.

  This will allow routing of messages to the correct receipient when
  `/to` messages are received.

**/
module.exports = function(mgr, spark, data, parts) {
  // get the payload (which is the last part)
  var payload = parts[parts.length - 1];
  var peerId = payload.id;
  var room;

  // update the spark metadata
  spark.metadata = payload;

  // create a lookup from the peer id to the spark id
  mgr.sparks.set(peerId, spark);

  // if we have a room, then get the spark to join the room
  room = spark.scope = mgr.joinRoom(payload.room || '__default', spark);

  // send the spark the room connection info
  spark.write('/roominfo|' + JSON.stringify({
    // send back the number of peers (including ourself)
    memberCount: room.sparks.length
  }));
};