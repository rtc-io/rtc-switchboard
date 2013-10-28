var server = require('./helpers/server');
var connect = require('./helpers/connect');
var uuid = require('uuid');

var start = module.exports = function(test, board) {
  var clients = [];
  var roomId = uuid.v4();

  test('connect 0', connect(board, clients, 0));
  test('connect 1', connect(board, clients, 1));
  test('connect 2', connect(board, clients, 2));

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
    clients[0].once('announce', checkData);
    board.once('announce', checkData);

    clients[1].announce({ room: roomId });
  });

  test('announce 2 - in different room to 0 + 1', function(t) {
    var newRoomId = uuid.v4();

    function failTest() {
      t.fail('captured announce message even though in a different room');
    }

    t.plan(3);

    board.once('announce', function(data) {
      t.equal(data.id, clients[2].id);
      t.equal(data.room, newRoomId);
    });

    clients[0].once('announce', failTest);
    clients[1].once('announce', failTest);

    setTimeout(function() {
      clients[0].removeListener('announce', failTest);
      clients[1].removeListener('announce', failTest);

      t.pass('did not trigger an event for clients in original room');
    }, 200);

    clients[2].announce({ room: newRoomId });
  });

  test('client 0 leave, client 1 notified, fail on client 2 notified', function(t) {
    t.plan(2);

    function failTest() {
      t.fail('captured announce message even though in a different room');
    }

    clients[2].once('leave', failTest);
    clients[1].once('leave', function(data) {
      t.equal(data.id, clients[0].id);
    });

    setTimeout(function() {
      clients[2].removeListener('leave', failTest);
      t.pass('did not trigger an event for clients in original room');

      // splice out the 0 client
      clients.splice(0, 1);
    }, 200);

    clients[0].leave();
  });

  test('close connections', function(t) {
    t.plan(clients.length);

    board.on('leave', function() {
      t.pass('captured leave');
    });

    clients.forEach(function(client) {
      client.leave();
    });
  });
};

if (! module.parent) {
  server.start(start);
}