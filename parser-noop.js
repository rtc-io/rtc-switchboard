'use strict';

exports.encoder = function encoder(data, fn) {
  fn(null, data);
};

exports.decoder = function decoder(data, fn) {
  fn(null, data);
};
