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
  test('connect 1', connect(board, clients, 1));

  test('announce 0', announce(board, clients, 0, { room: roomId }));
  test('announce 1', announce(board, clients, 1, { room: roomId }));

  test('check 2 room members', function(t) {
    var room = board.rooms.get(roomId);

    t.plan(2);
    t.ok(room && room.members, 'have room');
    t.equal(room.members.length, 2);
  });

  test('announce 1 in new room', announce(board, clients, 1, { room: room2 }));

  test('check 1 member in original room', function(t) {
    var room = board.rooms.get(roomId);

    t.plan(2);
    t.ok(room && room.members, 'have room');
    t.equal(room.members.length, 1);
  });

  test('check 1 member in new room', function(t) {
    var room = board.rooms.get(room2);

    t.plan(2);
    t.ok(room && room.members, 'have room');
    t.equal(room.members.length, 1);
  });

  test('close connections', cleanup(board, clients));

  test('check room has been destroyed', function(t) {
    var room = board.rooms.get(roomId);
    var failTimer;

    t.plan(1);
    if (! room) {
      return t.pass('room has been removed');
    }

    failTimer = setTimeout(t.fail.bind(t, 'room not destroyed'), 500);
    board.once('room:destroy', function(room) {
      t.equal(room, roomId, 'room has been removed');
      clearTimeout(failTimer);
    });
  });
};

if (! module.parent) {
  server.start(start);
}
