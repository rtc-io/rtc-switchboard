var server = require('./helpers/server');

server.start(function(test, board) {
  require('./connect')(test, board);
  require('./room-isolation')(test, board);
  require('./room-leave')(test, board);
  require('./to-messaging')(test, board);
});
