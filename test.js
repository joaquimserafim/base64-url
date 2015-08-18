'use strict';

var crypto = require('crypto');
var tape = require('tape');
var base64url = require('./index');

tape('base64', function(assert) {
  assert.plan(18);

  var text = 'Node.js is awesome.';

  var encode = base64url.encode(text);
  assert.ok(encode, 'encode: ' + encode);

  var decode = base64url.decode(encode);
  assert.deepEqual(decode, text, 'decode: ' + decode);

  var textEscape = 'This+is/goingto+escape==';

  var escape = base64url.escape(textEscape);
  assert.equal(escape.match(/\+|\//g), null,
    'escape (omit + and /): ' + escape);

  var unescape = base64url.unescape(escape);
  assert.equal(unescape.match(/\-|_/g),
    null,
    'unescape (back to first form): ' + unescape);

  ['pseudoRandomBytes', 'randomBytes'].forEach(function(fun) {
    crypto[fun] = function(size) {
      assert.equal(size, 3);
      return new Buffer('112233', 'hex');
    };
    var randomBytes = base64url[fun](3);
    assert.equal(randomBytes, 'ESIz', 'sync randomBytes: ' + randomBytes);

    crypto[fun] = function(size, callback) {
      assert.equal(size, 4);
      callback(new Error('error'));
    };

    base64url[fun](4, function(err) {
      assert.equal(err.message, 'error', 'randomBytes error: ' + err.message);
    });

    crypto[fun] = function(size, callback) {
      assert.equal(size, 6);
      callback(null, new Buffer('112233445566', 'hex'));
    };

    base64url[fun](6, function(err, randomBytes) {
      assert.equal(err, null, 'async randomBytes error: ' + err);
      assert.equal(randomBytes, 'ESIzRFVm', 'randomBytes: ' + randomBytes);
    });
  });
});
