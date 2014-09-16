var test = require('tape');
var base64url = require('../');


test('base64', function (t) {
  t.plan(4);

  var text = 'Node.js is awesome.';

  var encode = base64url.encode(text);
  t.ok(encode, 'encode: ' + encode);

  var decode = base64url.decode(encode);
  t.deepEqual(decode, text, 'decode: ' + decode);

  var textEscape = 'This+is/goingto+escape==';

  var escape = base64url.escape(textEscape);
  t.equal(escape.match(/\+|\//g), null, 'escape (omit + and /): ' + escape);

  var unescape = base64url.unescape(escape);
  t.equal(unescape.match(/\-|_/g), null, 'unescape (back to first form): ' + unescape);
});
