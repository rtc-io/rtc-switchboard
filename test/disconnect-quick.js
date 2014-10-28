var server = require('./helpers/server');
var signaller = require('rtc-signaller');
var messenger = require('rtc-switchboard-messenger');

var start = module.exports = function(test, board) {
  var socket;
  var sig;

  test('create a signaller', function(t) {
    t.plan(2);
    t.ok(sig = signaller(messenger('http://localhost:3001')), 'signaller created');
    sig.announce({ name: 'Fred', room: require('uuid').v4() });
    sig.once('connected', t.pass.bind(t, 'signaller open'));
  });

  test('disconnect signaller', function(t) {
    t.plan(1);
    sig.once('disconnected', t.pass.bind(t, 'disconnected'));
    sig.leave();
  });
};

if (! module.parent) {
  server.start(start);
}
