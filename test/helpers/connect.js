var signaller = require('rtc-signaller');

module.exports = function(board, clients, index, opts) {
  return function(t) {
    var socket;

    // only set the plan if not already done
    if (! t._plan) {
      t.plan(3);
    }

    // create the socket
    t.ok(socket = board.createSocket('http://localhost:3001'));
    t.ok(clients[index] = signaller(socket), 'created client ' + index);
    clients[index].once('open', t.pass.bind(t, 'connected'));

    // patch the socket into the signaller
    clients[index].socket = socket;
  };
}