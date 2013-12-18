module.exports = function(board, clients) {
  return function(t) {
    var count = 0;

    t.plan(clients.length);

    function handleLeave() {
      t.pass('captured leave');
    }

    t.on('result', function() {
      count += 1;
      if (count >= clients.length) {
        board.removeListener('leave', handleLeave);
      }
    });

    board.on('leave', handleLeave);

    clients.forEach(function(client) {
      client.leave();
      client.socket.end();
    });
  };
};