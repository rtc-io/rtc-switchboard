# rtc-signaller-primus

This is an rtc.io signaller that makes use of the excellent realtime
abstraction library, [primus](https://github.com/primus/primus).


[![NPM](https://nodei.co/npm/rtc-signaller-primus.png)](https://nodei.co/npm/rtc-signaller-primus/)

[![Build Status](https://travis-ci.org/rtc-io/rtc-signaller-primus.png?branch=master)](https://travis-ci.org/rtc-io/rtc-signaller-primus)
[![unstable](http://hughsk.github.io/stability-badges/dist/unstable.svg)](http://github.com/hughsk/stability-badges)

## Usage

To create an application using primus signalling, see the following
examples:

```js
var server = require('http').createServer();
var signaller = require('rtc-signaller-primus')(server);
var port = parseInt(process.env.SERVER_PORT || process.argv[2], 10) || 3000;

// start the server
server.listen(port, function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running on port: ' + port);
});
```

## License(s)

### Apache 2.0

Copyright 2013 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
