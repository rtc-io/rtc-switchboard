var server = require('./helpers/server');
var connect = require('./helpers/connect');
var announce = require('./helpers/announce');
var cleanup = require('./helpers/cleanup');
var uuid = require('uuid');

var start = module.exports = function(test, board) {
  var clients = [];
  var roomId = uuid.v4();

  test('connect 0', connect(board, clients, 0));
  test('connect 1', connect(board, clients, 1));

  test('announce 0', announce(board, clients, 0, { room: roomId }));
  test('announce 1', announce(board, clients, 1, { room: roomId }));

  test('check 2 room members', function(t) {
    t.plan(2);
    t.ok(board.rooms[roomId], 'have room');
    t.equal(board.rooms[roomId].sparks.length, 2);
  });

  test('close connections', cleanup(board, clients));

  test('check 0 room members', function(t) {
    t.plan(2);
    t.ok(board.rooms[roomId], 'have room');
    t.equal(board.rooms[roomId].sparks.length, 0);
  });
};

if (! module.parent) {
  server.start(start);
}