var test = require('tape');
var http = require('http');
var server = http.createServer();
var switchboard = require('../../');

function testClose() {
  var quitTimer;

  test('close the server', function(t) {
    t.plan(1);
    server.close(function() {
      clearTimeout(quitTimer);
      console.log('closed');
    });

    t.pass('server closed');

    // force quit
    quitTimer = setTimeout(process.exit.bind(process, 0), 1000);
  });
}

exports.start = function(innerTests) {
  test('start the test server', function(t) {
    var board;

    t.plan(1);
    board = switchboard(server);

    // listen
    server.listen(3001, function(err) {
      t.ifError(err, 'test server started');

      // run the inner tests
      innerTests(test, board);
      testClose();
    });
  });
};
