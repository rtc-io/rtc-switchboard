var server = require('./helpers/server');
var signaller = require('rtc-signaller');

var start = module.exports = function(test, board) {
  var socket;
  var signallers = [];

  test('create a socket', function(t) {
    t.plan(2);
    t.ok(socket = board.createSocket('http://localhost:3001'), 'socket created');
    socket.on('open', t.pass.bind(t, 'opened'));
  });

  test('wrap a signaller around the socket', function(t) {
    var sig;
    var spark;

    t.plan(6);
    board.once('announce', function(data) {
      t.equal(sig.id, data.id, 'announced signaller');

      // validate that the spark is mapped to the peer id
      t.ok(spark = board.sparks.get(data.id), 'got spark');

      // spark has the peer listed in
      t.ok(Array.isArray(spark.peers), 'spark has a peer list');
      t.equal(spark.peers.length, 1);
      t.ok(spark.peers.indexOf(data.id) >= 0, 'spark associated with peer');
    });

    // create the signaller instance
    t.ok(sig = signaller(socket), 'signaller created');

    // announce
    signallers.push(sig);
    sig.announce();
  });

  test('add an additional signaller to the socket', function(t) {
    var sig;
    var spark;

    t.plan(6);
    board.once('announce', function(data) {
      t.equal(sig.id, data.id, 'announced signaller');

      // validate that the spark is mapped to the peer id
      t.ok(spark = board.sparks.get(data.id), 'got spark');

      // spark has the peer listed in
      t.ok(Array.isArray(spark.peers), 'spark has a peer list');
      t.equal(spark.peers.length, 2);
      t.ok(spark.peers.indexOf(data.id) >= 0, 'spark associated with peer');
    });

    // create the signaller instance
    t.ok(sig = signaller(socket), 'signaller created');

    // announce
    signallers.push(sig);
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