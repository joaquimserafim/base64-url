'use strict';

var tape = require('tape');
var base64url = require('./index');

tape('base64', function(assert) {

  var text = 'Node.js is awesome.';

  var encode = base64url.encode(text);
  assert.ok(encode, 'encode: ' + encode);

  var decode = base64url.decode(encode);
  assert.deepEqual(decode, text, 'decode: ' + decode);

  var textEscape = 'This+is/goingto+escape==';

  var escape = base64url.escape(textEscape);

  assert.equal(
    escape.match(/\+|\//g),
    null,
    'escape (omit + and /): ' + escape
  );

  var unescape = base64url.unescape(escape);

  assert.equal(
    unescape.match(/\-|_/g),
    null,
    'unescape (back to first form): ' + unescape
  );

  assert.equal(
    base64url.unescape('1234'),
    '1234',
    'unescape should print 1234'
  );

  assert.equal(
    base64url.unescape('123'),
    '123=',
    'unescape should print 123='
  );

  assert.end();
});
