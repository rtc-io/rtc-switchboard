var async = require('async');
var room = process.env.ROOM || require('uuid').v4();
var switchboard = process.env.SWITCHBOARD || 'ws://localhost:3000/primus';
var signallers = [];

// require('cog/logger').enable('*');

function addSignaller(callback) {
  var signaller;
  var pending = signallers.length + 1;

  function checkPending() {
    if (pending <= 0) {
      callback();
    }
  }

  signallers.forEach(function(s) {
    s.once('peer:announce', function(data) {
      if (data.id === signaller.id) {
        pending--;
        checkPending();
      }
    });
  })

  signaller = require('rtc-signaller')(switchboard, { autoreply: false });

  signallers.push(signaller);
  signaller
    .once('error', callback)
    .once('connected', function() {
      pending--;
      checkPending();
    });

  signaller.announce({ room: room });
  console.log(signallers.length);
}

async.forever(addSignaller, function(err) {
  console.log('failed with err: ', err);
});

setInterval(function() {
  signallers[0].send('/ping');
}, 5000);
