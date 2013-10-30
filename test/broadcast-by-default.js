var server = require('./helpers/server');
var connect = require('./helpers/socket');
var uuid = require('uuid');

var start = module.exports = function(test, board) {
  var clients = [];

  test('connect 0', connect(board, clients, 0));
  test('connect 1', connect(board, clients, 1));
  test('connect 2', connect(board, clients, 2));

  test('broadcast string data', function(t) {
    t.plan(2);
    clients[1].once('data', function(message) {
      t.equal(message, 'hello');
    });

    clients[2].once('data', function(message) {
      t.equal(message, 'hello');
    });

    clients[0].write('hello');
  });

  test('broadcast object data', function(t) {
    t.plan(2);
    clients[1].once('data', function(message) {
      t.deepEqual(message, { foo: 'bar' });
    });

    clients[2].once('data', function(message) {
      t.deepEqual(message, { foo: 'bar' });
    });

    clients[0].write({ foo: 'bar' });
  });

  test('close connections', function(t) {
    t.plan(1);
    clients.forEach(function(client) {
      client.end();
    });

    t.pass('clients closed');
  });
};

if (! module.parent) {
  server.start(start);
}