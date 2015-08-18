'use strict';

var crypto = require('crypto');
var base64url = module.exports;

base64url.unescape = function unescape (str) {
  return (str + Array(5 - str.length % 4)
    .join('='))
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
};

base64url.escape = function escape (str) {
  return str.replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

base64url.encode = function encode (str) {
  return this.escape(new Buffer(str).toString('base64'));
};

base64url.decode = function decode (str) {
  return new Buffer(this.unescape(str), 'base64').toString();
};

base64url.pseudoRandomBytes = function pseudoRandomBytes (size, callback) {
  if (!callback) {
    return base64url.encode(crypto.pseudoRandomBytes(size));
  }

  crypto.pseudoRandomBytes(size, function(err, buffer) {
    if (err) {
      return callback(err);
    }
    callback(null, base64url.encode(buffer));
  });
};

base64url.randomBytes = function randomBytes (size, callback) {
  if (!callback) {
    return base64url.encode(crypto.randomBytes(size));
  }

  crypto.randomBytes(size, function(err, buffer) {
    if (err) {
      return callback(err);
    }
    callback(null, base64url.encode(buffer));
  });
};
