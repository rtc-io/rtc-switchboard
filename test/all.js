var server = require('./helpers/server');

server.start(function(test, board) {
  require('./connect')(test, board);
  require('./room-isolation')(test, board);
});
