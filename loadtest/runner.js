var times = require('whisk/times');
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
  return fork(__dirname + '/' + (parsed.test || 'simple') + '.js', {
    env: {
    },

    stdio: 'pipe'
  });
});

console.log(procs);
