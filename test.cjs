'use strict'

const test = require('tape')
const base64url = require('./index.cjs')

test('base64 - CJS', function (assert) {
  const text = 'Node.js is awesome.'

  const encode = base64url.encode(text)
  assert.ok(encode, 'encode: ' + encode)

  const decode = base64url.decode(encode)
  assert.deepEqual(decode, text, 'decode: ' + decode)

  const textEscape = 'This+is/goingto+escape=='

  const escape = base64url.escape(textEscape)

  assert.equal(
    escape.match(/\+|\//g),
    null,
    'escape (omit + and /): ' + escape
  )

  const unescape = base64url.unescape(escape)

  assert.equal(
    unescape.match(/-|_/g),
    null,
    'unescape (back to initial state): ' + unescape
  )

  assert.equal(
    base64url.unescape('1234'),
    '1234',
    'unescape should print 1234'
  )

  assert.equal(
    base64url.unescape('123'),
    '123=',
    'unescape should print 123='
  )

  assert.end()
})

test('using a different encoding with the encode and decode methods - CJS',
  function (assert) {
    assert.equal(
      base64url.encode('ride: dreams burn down', 'ascii'),
      'cmlkZTogZHJlYW1zIGJ1cm4gZG93bg',
      'should return `cmlkZTogZHJlYW1zIGJ1cm4gZG93bg`'
    )

    assert.equal(
      base64url.decode('cmlkZTogZHJlYW1zIGJ1cm4gZG93bg', 'ascii'),
      'ride: dreams burn down',
      'should return `ride: dreams burn down`'
    )

    assert.end()
  }
)
