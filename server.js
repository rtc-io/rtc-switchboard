var server = require('http').createServer();
var switchboard = require('./')(server, { servelib: true });
var port = parseInt(process.env.NODE_PORT || process.env.PORT || process.argv[2], 10) || 3000;
var host = process.env.NODE_HOST || process.env.HOST || 'localhost';
// var replify = require('replify');

server.on('request', function(req, res) {
  if (req.url === '/') {
    res.writeHead(302, {
      'Location': 'https://github.com/rtc-io/rtc-switchboard'
    });
    res.end('switchboard available from: https://github.com/rtc-io/rtc-switchboard');
  }
});

// start the server
server.listen(port, host, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running at http://' + host + ':' + port + '/');
});

// // add the repl
// replify({
//   name: 'switchboard',
//   app: switchboard,
//   contexts: {
//     server: server
//   }
// });
//
// switchboard.on('room:create', function(room) {
//   console.log('room ' + room + ' created, now have ' + switchboard.rooms.length + ' active rooms');
// });
//
// switchboard.on('room:destroy', function(room) {
//   console.log('room ' + room + ' destroyed, ' + switchboard.rooms.length + ' active rooms remain');
//
//   if (typeof gc == 'function') {
//     console.log('gc');
//     gc();
//   }
// });
