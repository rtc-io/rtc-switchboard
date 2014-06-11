var quickconnect = require('rtc-quickconnect');

quickconnect('//switchboard.rtc.io/', { room: 'switchboard-test' })
  .createDataChannel('test')
  .once('channel:opened:test', function(peerId, dc) {
    dc.onmessage = function(evt) {
      console.log('received data: ', evt.data);
    };

    dc.send('hello');
  });
