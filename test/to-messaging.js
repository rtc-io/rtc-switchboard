var server = require('./helpers/server');
var connect = require('./helpers/connect');
var announce = require('./helpers/announce');
var cleanup = require('./helpers/cleanup');
var uuid = require('uuid');

var start = module.exports = function(test, board) {
  var clients = [];
  var roomId = uuid.v4();

  test('connect 0', connect(board, clients, 0, { autoreply: true }));
  test('connect 1', connect(board, clients, 1, { autoreply: true }));
  test('connect 2', connect(board, clients, 2, { autoreply: true }));

  test('announce 0', announce(board, clients, 0, { room: roomId }));
  test('announce 1', announce(board, clients, 1, { room: roomId }));
  test('announce 2', announce(board, clients, 2, { room: uuid.v4() }));

  test('send from 0 --> 1', function(t) {
    t.plan(1);

    clients[1].on('hello', function(data) {
      t.equal(data.a, 1, 'got message');
    });

    setTimeout(function() {
      clients[0].to(clients[1].id).send('/hello', { a: 1 });
    }, 200);
  });

  // test('send from 1 --> 2', function(t) {
  //   t.plan(1);

  //   clients[2].on('hello', function(data) {
  //     t.equal(data.b, 2, 'got message');
  //   });

  //   clients[1].to(clients[2].id).send('/hello', { b: 2 });
  // });

  // test('send from 2 --> 0', function(t) {
  //   t.plan(1);

  //   clients[0].on('hello', function(data) {
  //     t.equal(data.c, 3, 'got message');
  //   });

  //   clients[2].to(clients[0].id).send('/hello', { c: 3 });
  // });

  test('close connections', cleanup(board, clients));
};

if (! module.parent) {
  server.start(start);
}