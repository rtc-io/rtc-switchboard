module.exports = function(board, clients, index) {
  return function(t) {
    t.plan(2);
    t.ok(clients[index] = board.createSocket('http://localhost:3001'), 'created client ' + index);
    clients[index].once('open', t.pass.bind(t, 'connected'));
  };
}