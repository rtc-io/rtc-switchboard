var server = require('./helpers/server');
var connect = require('./helpers/connect');
var cleanup = require('./helpers/cleanup');
var uuid = require('uuid');

var start = module.exports = function(test, board) {
  var clients = [];
  var roomId = uuid.v4();

  test('connect 0', connect(board, clients, 0));
  test('connect 1', connect(board, clients, 1));

  test('switchboard emits a room:create event when a new room is created', function(t) {
    t.plan(1);

    board.once('room:create', function(name) {
      t.equal(name, roomId, 'room id match');
    });

    clients[0].announce({ room: roomId });
  });

  test('client:0 close, room:destroy event fires', function(t) {
    t.plan(1);

    board.once('room:destroy', function(name) {
      t.equal(name, roomId, 'room id match');
    });

    clients[0].leave();
  });

  test('connect 0', connect(board, clients, 0));

  test('switchboard emits another room:create event when a new room is recreated', function(t) {
    t.plan(1);

    board.once('room:create', function(name) {
      t.equal(name, roomId, 'room id match');
    });

    clients[0].announce({ room: roomId });
  });

  test('switchboard does not emit a room:create event when the client joins the room', function(t) {
    t.plan(1);

    function handleCreate(name) {
      t.fail('room:create event should not have fired');
    }

    board.once('room:create', handleCreate);

    setTimeout(function() {
      board.removeListener('room:create', handleCreate);
      t.pass('room:create event did not fire');
    }, 100);

    clients[1].announce({ room: roomId });
  });

  test('client:0 close, room:destroy does not fire', function(t) {
    t.plan(1);

    function handleDestroy(name) {
      t.fail('room:destroy should not have fired');
    }

    board.once('room:destroy', handleDestroy);

    setTimeout(function() {
      board.removeListener('room:destroy', handleDestroy);
      t.pass('room:destroy event did not fire');
    }, 100);

    clients[0].leave();
  });

  test('client:1 close, room:destroy does fire', function(t) {
    t.plan(1);

    board.once('room:destroy', function(name) {
      t.equal(name, roomId, 'room id match');
    });

    clients[1].leave();
  });

  test('connect 0', connect(board, clients, 0));

  test('switchboard emits another room:create event when a new room is recreated', function(t) {
    t.plan(1);

    board.once('room:create', function(name) {
      t.equal(name, roomId, 'room id match');
    });

    clients[0].announce({ room: roomId });
  });

  test('switchboard emits room:create and room:destroy events when a client changes room', function(t) {
    var newRoomId = uuid.v4();

    t.plan(2);

    board.once('room:destroy', function(name) {
      t.equal(name, roomId, 'old room destroyed');
    });

    board.once('room:create', function(name) {
      t.equal(name, newRoomId, 'new room created');
    });

    clients[0].announce({ room: newRoomId });
  });

  test('client:0 close', function(t) {
    t.plan(1);

    board.once('room:destroy', function(name) {
      t.notEqual(name, roomId, 'new room destroyed');
    });

    clients[0].leave();
  });

  // no close required as clients have been removed and movements tracked
};

if (! module.parent) {
  server.start(start);
}
