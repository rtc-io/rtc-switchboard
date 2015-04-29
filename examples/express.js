var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;

// create the switchboard
var switchboard = require('..')(server);

server.listen(port, function(err) {
  if (err) {
    return;
  }

  console.log('server listening on port: ' + port);
});
