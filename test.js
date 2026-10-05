import test from 'tape'
import base64url, { decode, encode, escape, unescape } from './index.js'

test('base64 - default export', function (assert) {
  const text = 'Node.js is awesome.'

  const encoded = base64url.encode(text)
  assert.ok(encoded, 'encode: ' + encoded)

  const decoded = base64url.decode(encoded)
  assert.deepEqual(decoded, text, 'decode: ' + decoded)

  const textEscape = 'This+is/goingto+escape=='

  const escaped = base64url.escape(textEscape)

  assert.equal(
    escaped.match(/\+|\//g),
    null,
    'escape (omit + and /): ' + escaped
  )

  const unescaped = base64url.unescape(escaped)

  assert.equal(
    unescaped.match(/-|_/g),
    null,
    'unescape (back to initial state): ' + unescaped
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

test('base64 - named exports', function (assert) {
  const text = 'Node.js is awesome.'

  const encoded = encode(text)
  assert.ok(encoded, 'encode: ' + encoded)

  const decoded = decode(encoded)
  assert.deepEqual(decoded, text, 'decode: ' + decoded)

  const textEscape = 'This+is/goingto+escape=='

  const escaped = escape(textEscape)

  assert.equal(
    escaped.match(/\+|\//g),
    null,
    'escape (omit + and /): ' + escaped
  )

  const unescaped = unescape(escaped)

  assert.equal(
    unescaped.match(/-|_/g),
    null,
    'unescape (back to initial state): ' + unescaped
  )

  assert.end()
})

test('using a different encoding with the encode and decode methods',
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

    assert.equal(
      encode('ride: dreams burn down', 'ascii'),
      'cmlkZTogZHJlYW1zIGJ1cm4gZG93bg',
      'named export should return `cmlkZTogZHJlYW1zIGJ1cm4gZG93bg`'
    )

    assert.equal(
      decode('cmlkZTogZHJlYW1zIGJ1cm4gZG93bg', 'ascii'),
      'ride: dreams burn down',
      'named export should return `ride: dreams burn down`'
    )

    assert.end()
  }
)
