/* jshint node: true */
'use strict';

/**
  ### announce handler

  Will handle `/announce` messages and associate the peer id assigned by
  the client-side signaller with the socket on the server side.

  This will allow routing of messages to the correct receipient when
  `/to` messages are received.
  
**/
module.exports = function(io, socket, data) {
  var payload = data.slice(data.indexOf('|') + 1);

  try {
    payload = JSON.parse(payload);
  }
  catch (e) {
    // invalid payload, prevent broadcast
    return true;
  }

  // attach the peer id to the socket
  socket.peerId = payload.id;
};