'use strict';

exports.encoder = function encoder(data, fn) {
  fn(null, data);
};

exports.decoder = function decoder(data, fn) {
  // var isString = typeof data == 'string' || (data instanceof String);
  // var firstChar = isString && data.length > 1 && data.charAt(0);
  // var lastChar = isString && data.length > 1 && data.charAt(data.length - 1);

  // if (! isString) {
  //   return fn(null, data);
  // }

  // // if we have been passed what appears to be a JSONified string
  // // then parse it.  This is required for 

  fn(null, data);
};
