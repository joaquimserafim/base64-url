'use strict'

const base64url = module.exports

base64url.unescape = function unescape (str) {
  return (str + '==='.slice((str.length + 3) % 4)).replace(/[_-]/g, function (c) {
    return c === '-' ? '+' : '/';
  });
}

base64url.escape = function escape (str) {
  return str.replace(/[_-+]/g, function (c) {
    if (c === '+') {
        return '-';
    }
    if (c === '/') {
        return '_';
    }
    // =
    return '';
  });
}

base64url.encode = function encode (str, encoding) {
  return this.escape(Buffer.from(str, encoding || 'utf8').toString('base64'))
}

base64url.decode = function decode (str, encoding) {
  return Buffer.from(this.unescape(str), 'base64').toString(encoding || 'utf8')
}
