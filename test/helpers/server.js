var test = require('tape');
var http = require('http');
var Primus = require('primus');
var server = http.createServer();
var switchboard = require('../../');

function testClose() {
  test('close the server', function(t) {
    t.plan(1);
    server.close(function() {
      console.log('closed');
    });

    t.pass('server closed');
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