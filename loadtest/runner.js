var times = require('whisk/times');
var uuid = require('uuid');
var fork = require('child_process').fork;
var nopt = require('nopt');
var knownOpts = {
  'test': [ String ],
  'count': [ Number ]
};
var shorthands = {
  't': [ '--test' ],
  'c': [ '--count' ]
};
var parsed = nopt(knownOpts, shorthands, process.argv, 2);

var procs = times(parsed.count || 1).map(function() {
  var room = uuid.v4();
  var proc = fork(__dirname + '/' + (parsed.test || 'simple') + '.js', {
    env: {
      SWITCHBOARD: process.env.SWITCHBOARD,
      ROOM: room
    },

    silent: false
  });

  proc.room = room;
  return proc;
});

function cleanupOnExit(proc) {
  proc.on('exit', function(code) {
    procs.splice(procs.indexOf(proc), 1);
    console.log('process ' + proc.pid + ' (room: ' + proc.room + ') exited with errcode: ' + code + ', ' + procs.length + ' remaining');
  });
}

procs.forEach(function(proc) {
  proc
    .on('error', function(err) {
      console.log('captured error from proc: ', err);
    });

  cleanupOnExit(proc);
});
