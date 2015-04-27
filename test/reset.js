var server = require('./helpers/server');
var connect = require('./helpers/connect');
var cleanup = require('./helpers/cleanup');
var uuid = require('uuid');

var start = module.exports = function(test, board) {
  var clients = [];
  var roomId = uuid.v4();

  test('connect 0', connect(board, clients, 0));
  test('connect 1', connect(board, clients, 1));

  test('announce 0', function(t) {
    t.plan(2);

    board.once('announce', function(data) {
      t.equal(data.id, clients[0].id);
      t.equal(data.room, roomId);
    });

    clients[0].announce({ room: roomId });
  });

  test('announce 1 - in same room as 0', function(t) {

    function checkData(data) {
      t.equal(data.id, clients[1].id);
      t.equal(data.room, roomId);
    }

    t.plan(4);
    clients[0].once('peer:announce', checkData);
    board.once('announce', checkData);

    clients[1].announce({ room: roomId });
  });

  test('check that peer 0 responds to peer 0', function(t) {
    t.plan(2);
    clients[1].once('peer:announce', function(data) {
      t.equal(data.id, clients[0].id);
      t.equal(data.room, roomId);
    });
  });

  test('a peer disconnect event is triggered when we reset the switchboard', function(t) {
    t.plan(1);

    var failTimer = setTimeout(function() {
      t.fail('peer:disconnect should have been fired.');
    }, 100);

    board.once('peer:disconnect', function(name) {
      clearTimeout(failTimer);
      t.pass('peer:disconnect was indeed fired.');
    });

    board.reset();
  });
};

if (! module.parent) {
  server.start(start);
}
