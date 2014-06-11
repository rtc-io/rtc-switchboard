var server = require('http').createServer();
var switchboard = require('./')(server, { servelib: true });
var port = parseInt(process.env.NODE_PORT || process.env.PORT || process.argv[2], 10) || 3000;

server.on('request', function(req, res) {
  if (req.url === '/') {
    res.writeHead(302, {
      'Location': 'https://github.com/rtc-io/rtc-switchboard'
    });
    res.end('switchboard available from: https://github.com/rtc-io/rtc-switchboard');
  }
});

// start the server
server.listen(port, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running at http://localhost:' + port + '/');
});
