var signaller = require('rtc-signaller');
var messenger = require('rtc-switchboard-messenger');

module.exports = function(board, clients, index, opts) {
  return function(t) {
    var socket;

    // only set the plan if not already done
    if (! t._plan) {
      t.plan(2);
    }

    // create the socket
    t.ok(clients[index] = signaller(messenger('http://localhost:3001/')), 'created client ' + index);
    clients[index].once('connected', t.pass.bind(t, 'connected'));

    // patch the socket into the signaller
    clients[index].socket = socket;
  };
}
