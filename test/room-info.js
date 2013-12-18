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
    t.plan(4);

    board.once('announce', function(data) {
      t.equal(data.id, clients[0].id);
      t.equal(data.room, roomId);
    });

    clients[0].once('roominfo', function(data) {
      t.ok(data && typeof data == 'object');
      t.equal(data.memberCount, 1, 'reported as 1st peer');
    });

    clients[0].announce({ room: roomId });
  });

  test('announce 1', function(t) {
    t.plan(4);

    board.once('announce', function(data) {
      t.equal(data.id, clients[1].id);
      t.equal(data.room, roomId);
    });

    clients[1].once('roominfo', function(data) {
      t.ok(data && typeof data == 'object');
      t.equal(data.memberCount, 2, 'reported as 2nd peer');
    });

    clients[1].announce({ room: roomId });
  });

  test('close connections', cleanup(board, clients));
};

if (! module.parent) {
  server.start(start);
}