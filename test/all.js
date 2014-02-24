var server = require('./helpers/server');

server.start(function(test, board) {
  require('./connect')(test, board);
  require('./room-isolation')(test, board);
  require('./room-leave')(test, board);
  require('./room-info')(test, board);
  require('./room-changes')(test, board);
  require('./room-events')(test, board);
  require('./to-messaging')(test, board);
});
