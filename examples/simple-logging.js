var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;
var bunyan = require('bunyan');
var log = bunyan.createLogger({ name: 'rtc-switchboard' });

// create the switchboard
var switchboard = require('..')(server);

// we need to expose the primus library
app.get('/rtc.io/primus.js', switchboard.library());

server.listen(port, function(err) {
  if (err) {
    return;
  }

  console.log('server running at: http://localhost:' + port + '/');
});

switchboard.on('data', function(data, peerId, spark) {
  log.info({ peer: peerId }, 'received: ' + data);
});