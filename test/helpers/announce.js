module.exports = function(board, clients, idx, data) {
  return function(t) {
    t.plan(1);
    board.once('announce', function(d) {
      // give time for the client announce to come back
      setTimeout(function() {
        t.equal(d.id, clients[idx].id, 'client connected');
      }, 500);
    });

    clients[idx].announce(data);
  };
}