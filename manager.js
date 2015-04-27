var mbus = require('mbus');
var curry = require('curry');
var extend = require('cog/extend');
var jsonparse = require('cog/jsonparse');
var MultiMap = require('collections/multi-map');
var FastMap = require('collections/fast-map');
var SortedMap = require('collections/sorted-map');

module.exports = function(primus, opts) {
  var mgr = mbus('switchboard');
  var handlers = extend({
    announce: require('./handlers/announce'),
    ping: require('./handlers/ping')
  }, (opts || {}).handlers);

  var rooms = mgr.rooms = new FastMap();
  var peers = mgr.peers = new SortedMap();

  var processData = curry(function(spark, data) {
    var parts;
    var handler;
    var command;
    var target;
    var relay = true;

    // if we have string data then preprocess
    if (typeof data == 'string' || (data instanceof String)) {
      if (data.charAt(0) === '/') {
        // initialise the command name
        command = data.slice(1, data.indexOf('|', 1)).toLowerCase();

        // get the payload
        parts = data.slice(command.length + 2).split('|').map(jsonparse);

        // if we have a to command, and no designated target
        if (command === 'to') {
          target = mgr.peers.get(parts[0]);

          // if the target is unknown, refuse to send
          if (! target) {
            console.warn('got a to request for id "' + parts[0] + '" but cannot find target');
            return false;
          }
        }
      }
    }

    // look for commands and handlers
    handler = command && handlers[command];

    // if we have a handler, invoke
    if (typeof handler == 'function') {
      relay = handler(mgr, spark, parts, primus, opts);
    }

    if (command) {
      mgr(command, parts[1], spark);
    }

    // if we have a room, and the relay flag has been set, then relay
    if (target) {
      target.write(data);
    }
    else if (spark.room && relay) {
      spark.room(data, spark);
    }

    // report the data for logging / analysis
    mgr('data', data, spark.peerId, spark);
  });

  var sendToRoom = curry(function(name, data, src) {
    (rooms.get(name) || []).forEach(function(spark) {
      // don't send stuff to ourselves that we have sent
      if (spark === src) {
        return;
      }

      spark.write(data);
    });
  });

  var assignRoom = curry(function(name, spark) {
    var sparks = (rooms.get(name) || []).concat(spark);

    // if the spark existed in a prior room, then remove from that room
    if (spark.roomid) {
      removeMember(spark.roomid, spark);
    }

    // update the room sparks
    rooms.set(name, sparks);
    spark.roomid = name;

    // write the number of sparks in the room back to the spark
    spark.write('/roominfo|' + JSON.stringify({
      // send back the number of peers (including ourself)
      memberCount: sparks.length
    }));

    // if this is the first spark in the room we have a new room
    if (sparks.length === 1) {
      mgr('room:create', name);
    }

    return sendToRoom(name);
  });

  var removeMember = curry(function(name, spark) {
    var sparks = rooms.get(name);

    // if we have no room, then abort
    if (! sparks) {
      return;
    }

    // trigger a manager level leave event for the peer
    mgr('leave', spark);

    // remove the spark from the list, creating a new array
    sparks = sparks.filter(function(item) {
      return item !== spark;
    });

    if (sparks.length === 0) {
      rooms.delete(name);
      mgr('room:destroy', name);
    }
    else {
      rooms.set(name, sparks);
    }
  });

  function reset() {
    rooms.keys().forEach(function(id) {
      (rooms.get(id) || []).forEach(function(spark) {
        spark.end();
      });

      // delete the room
      rooms.delete(id);
    });
  }

  function serveLibrary(opts) {
    return function(req, res) {
      res.writeHead(200, {
        'content-type': 'application/javascript'
      });

      res.end(primus.library());
    };
  }

  primus.on('connection', function(spark) {
    spark.on('data', processData(spark));
    mgr('peer:connect', spark);
  });

  primus.on('disconnection', function(spark) {
    if (spark.roomid) {
      removeMember(spark.roomid, spark);
    }

    if (spark.peerId) {
      console.log('disconnected peer: ' + spark.peerId);
      peers.delete(spark.peerId);
    }

    mgr('peer:disconnect', spark);
  });

  mgr.library = serveLibrary;
  mgr.assignRoom = assignRoom;
  mgr.createSocket = primus.Socket;
  mgr.reset = reset;

  return mgr;
};
