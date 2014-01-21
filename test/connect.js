var server = require('./helpers/server');
var signaller = require('rtc-signaller');

var start = module.exports = function(test, board) {
  var socket;
  var signallers = [];

  test('create a socket', function(t) {
    t.plan(2);
    t.ok(socket = board.createSocket('http://localhost:3001'), 'socket created');
    socket.once('open', t.pass.bind(t, 'opened'));
  });

  test('wrap a signaller around the socket', function(t) {
    var sig;
    var spark;

    t.plan(5);
    board.once('announce', function(data) {
      t.equal(sig.id, data.id, 'announced signaller');

      // validate that the spark is mapped to the peer id
      t.ok(spark = board.sparks.get(data.id), 'got spark');

      // spark has the peer listed in
      t.ok(spark.metadata, 'spark now has metadata');
      t.equal(spark.metadata.id, data.id, 'spark associated with client id');
    });

    // create the signaller instance
    t.ok(sig = signaller(socket), 'signaller created');

    // announce
    signallers.push(sig);
    sig.announce();
  });

  test('close the socket', function(t) {
    t.plan(1);
    socket.end();
    t.pass('closed');
  });
};

if (! module.parent) {
  server.start(start);
}