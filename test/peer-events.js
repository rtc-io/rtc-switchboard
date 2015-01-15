var server = require('./helpers/server');
var connect = require('./helpers/connect');
var cleanup = require('./helpers/cleanup');
var uuid = require('uuid');

var start = module.exports = function(test, board) {
  var clients = [];

  test('peer:connect event is emitted when a new peer connects', function(t) {
    t.plan(3);

    var failTimer = setTimeout(function() {
      t.fail('peer:connect should have been fired.');
    }, 100);

    board.once('peer:connect', function(name) {
      clearTimeout(failTimer);
      t.pass('peer:connect was indeed fired.');
    });

    connect(board, clients, 0)(t);
  });

  test('peer:disconnect event is emitted when a peer packs up.', function(t) {
    t.plan(1);

    var failTimer = setTimeout(function() {
      t.fail('peer:disconnect should have been fired.');
    }, 100);

    board.once('peer:disconnect', function(name) {
      clearTimeout(failTimer);
      t.pass('peer:disconnect was indeed fired.');
    });

    clients[0].leave();    
  });

};

if (! module.parent) {
  server.start(start);
}
