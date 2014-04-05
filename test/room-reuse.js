var server = require('./helpers/server');
var connect = require('./helpers/connect');
var announce = require('./helpers/announce');
var cleanup = require('./helpers/cleanup');
var uuid = require('uuid');

var start = module.exports = function(test, board) {
  var clients = [];
  var roomId = uuid.v4();
  var room2 = uuid.v4();

  test('connect 0', connect(board, clients, 0));
  test('announce 0', announce(board, clients, 0, { room: roomId }));
  test('close connections', cleanup(board, clients));

  test('check room has been destroyed', function(t) {
    t.plan(1);
    t.notOk(board.rooms[roomId], 'room has been removed');
  });

  test('reuse room: connect 0', connect(board, clients, 0));
  test('reuse room: announce 0', announce(board, clients, 0, { room: roomId }));
  test('reuse room: close connections', cleanup(board, clients));

  test('reuse room: check room has been destroyed', function(t) {
    t.plan(1);
    t.notOk(board.rooms[roomId], 'room has been removed');
  });
};

if (! module.parent) {
  server.start(start);
}