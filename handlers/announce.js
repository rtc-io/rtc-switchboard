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
  var peerId = payload.id;

  // add the peer id to the list of peers known to this spark
  spark.peers = spark.peers || [];
  spark.peers.push(peerId);

  // create a lookup from the peer id to the spark id
  mgr.sparks.set(peerId, spark);

  // if we have a room, then get the spark to join the room
  if (payload.room) {
    spark.scope = mgr.joinRoom(payload.room, spark);
  }
};