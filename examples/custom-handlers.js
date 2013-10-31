var server = require('http').createServer();
var Primus = require('primus');

// create the signaller, providing our own primus instance (using engine.io)
var switchboard = require('../')(server, {
  servelib: true,
  handlers: {
    img: require('./handlers/img')
  }
});

// start the server
server.listen(3000);