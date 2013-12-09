var signaller = require('rtc-signaller');

module.exports = function(board, clients, index, opts) {
  return function(t) {
    var socket;

    t.plan(1);

    socket = board.createSocket('http://localhost:3001');
    socket.once('open', function() {
      clients[index] = signaller(socket, opts || { autoreply: false });
      t.pass('connected');
    });
  };
}