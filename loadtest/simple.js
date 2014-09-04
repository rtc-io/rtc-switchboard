var async = require('async');
var room = process.env.ROOM || require('uuid').v4();
var switchboard = process.env.SWITCHBOARD || 'ws://switchboard.elasticbeanstalk.com/primus';
var signallers = [];

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

  signaller.once('connected', function() {
    console.log('connected to signalling server');
    pending--;
    checkPending();
  });

  signaller.announce({ room: room });
  console.log(signallers.length);
}

async.forever(addSignaller, function(err) {
  console.log('failed with err: ', err);
});
