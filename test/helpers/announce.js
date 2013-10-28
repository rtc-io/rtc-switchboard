var signaller = require('rtc-signaller');

module.exports = function(board, clients, idx, data) {
  return function(t) {
    t.plan(1);
    board.once('announce', function(d) {
      t.equal(d.id, clients[idx].id, 'client connected');
    });

    clients[idx].announce(data);
  };
}