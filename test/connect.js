var test = require('tape');
var switchboard = require('..');
var server = require('./helpers/server');

test('start the test server', function(t) {
  t.plan(1);
  server.start(function(err, primus) {
    t.ifError(err);
  });
});

test('stop the server', function(t) {
  t.plan(1);
  server.stop();
  t.pass('stopped');
});