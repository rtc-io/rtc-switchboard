var server = require('./helpers/server');
var signaller = require('rtc-signaller');

var start = module.exports = function(test, board) {
  var socket;

  test('create a socket', function(t) {
    t.plan(2);
    t.ok(socket = board.createSocket('http://localhost:3001'), 'socket created');
    socket.on('open', t.pass.bind(t, 'opened'));
  });

  test('wrap a signaller around the socket', function(t) {
    var sig;

    t.plan(2);
    board.once('announce', function(data) {
      t.equal(sig.id, data.id, 'announced signaller');
    });

    // create the signaller instance
    t.ok(sig = signaller(socket), 'signaller created');

    // announce
    sig.announce();
  });

  // TODO: support plain old messages
  // test('can use object serialization', function(t) {
  //   t.plan(1);
  //   board.once('announce', t.pass.bind(t, 'ok'));

  //   socket.write({ command: 'announce' });
  // });

  test('close the socket', function(t) {
    t.plan(1);
    socket.end();
    t.pass('closed');
  });
};

if (! module.parent) {
  server.start(start);
}