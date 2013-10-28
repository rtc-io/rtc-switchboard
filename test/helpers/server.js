var http = require('http');
var server = http.createServer();
var switchboard = require('../../');

exports.start = function(callback) {
  var primus = switchboard(server);

  server.listen(3000, function(err) {
    callback(err, primus);
  });
};

exports.stop = function() {
  server.close();
};