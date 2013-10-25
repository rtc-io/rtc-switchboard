var server = require('http').createServer();
var signaller = require('./')(server);
var port = parseInt(process.env.SERVER_PORT || process.argv[2], 10) || 3000;

io.sockets.on('connection', signaller);

// start the server
server.listen(port, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running on port: ' + port);
});