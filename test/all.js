var server = require('./helpers/server');

server.start(function(test, board) {
  require('./disconnect-quick')(test, board);
  require('./room-isolation')(test, board);
  require('./room-leave')(test, board);
  require('./room-reuse')(test, board);
  require('./room-info')(test, board);
  require('./room-changes')(test, board);
  require('./room-events')(test, board);
  require('./to-messaging')(test, board);
  require('./signaller-durability')(test, board);
  require('./peer-events')(test, board);
  require('./reset')(test, board);
});
