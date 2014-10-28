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

    clients[0].once('message:roominfo', function(data) {
      t.ok(data && typeof data == 'object');
      t.equal(data.memberCount, 1, 'reported as 1st peer');
    });

    clients[0].announce({ room: roomId });
  });

  test('announce 1', function(t) {
    t.plan(2);

    clients[1].once('message:roominfo', function(data) {
      t.ok(data && typeof data == 'object');
      t.equal(data.memberCount, 2, 'reported as 2nd peer');
    });

    clients[1].announce({ room: roomId });
  });

  test('signallers remain connected and do not timeout', function(t) {
    var timer = setInterval(t.pass.bind(t, 'still connected'), 5e3);
    var waitIntervals = 10;

    function handleDisconnect() {
      unbindHandlers();
      t.fail('signaller disconnected');
    }

    function unbindHandlers() {
      clients.forEach(function(c) {
        c.removeListener('disconnected', handleDisconnect);
      });
    }

    clients.forEach(function(c) {
      c.on('disconnected', handleDisconnect);
    });

    setTimeout(function() {
      clearInterval(timer);
      unbindHandlers();
      t.pass('completed checks');
    }, waitIntervals * 5e3 + 1e3);

    t.plan(waitIntervals + 1);
  });

  test('close connections', cleanup(board, clients));
};

if (! module.parent) {
  server.start(start);
}
