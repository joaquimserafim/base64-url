'use strict'

module.exports = {
  unescape: unescape,
  escape: escape,
  encode: encode,
  decode: decode
}

function unescape (str) {
  return (str + '==='.slice((str.length + 3) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
}

function escape (str) {
  return str.replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function encode (str, encoding) {
  return escape(Buffer.from(str, encoding || 'utf8').toString('base64'))
}

function decode (str, encoding) {
  return Buffer.from(unescape(str), 'base64').toString(encoding || 'utf8')
}
