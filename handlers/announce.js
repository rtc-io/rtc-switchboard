/* jshint node: true */
'use strict';

/**
  ### announce handler

  Will handle `/announce` messages and associate the peer id assigned by
  the client-side signaller with the socket on the server side.

  This will allow routing of messages to the correct receipient when
  `/to` messages are received.

**/
module.exports = function(mgr, spark, data, payload) {
  // attach the peer id to the socket
  spark.peerId = payload.id;

  // create a lookup from the peer id to the spark id
  mgr.sparks.set(spark.peerId, spark);

  // if we have a room, then get the spark to join the room
  if (payload.room) {
    spark.scope = mgr.joinRoom(payload.room, spark);
  }
};