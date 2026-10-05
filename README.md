# base64-url

Base64 encode, decode, escape and unescape for URL applications.

<a href="https://nodei.co/npm/base64-url/"><img src="https://nodei.co/npm/base64-url.png?downloads=true"></a>

[![Build Status](https://travis-ci.org/joaquimserafim/base64-url.svg?branch=master)](https://travis-ci.org/joaquimserafim/base64-url)[![Coverage Status](https://coveralls.io/repos/github/joaquimserafim/base64-url/badge.svg)](https://coveralls.io/github/joaquimserafim/base64-url)[![ISC License](https://img.shields.io/badge/license-ISC-blue.svg?style=flat-square)](https://github.com/joaquimserafim/base64-url/blob/master/LICENSE)

## Usage

### ES Modules (ESM)

```js
// Named imports (tree-shakable)
import { encode, decode, escape, unescape } from 'base64-url'

encode('Node.js is awesome.')
// returns Tm9kZS5qcyBpcyBhd2Vzb21lLg

decode('Tm9kZS5qcyBpcyBhd2Vzb21lLg')
// returns Node.js is awesome.

escape('This+is/goingto+escape==')
// returns This-is_goingto-escape

unescape('This-is_goingto-escape')
// returns This+is/goingto+escape==

// Or default import
import base64url from 'base64-url'

base64url.encode('Node.js is awesome.')
```

### CommonJS (CJS)

```js
const base64url = require('base64-url')
// or const { encode, decode, escape, unescape } = require('base64-url')

base64url.encode('Node.js is awesome.')
```

### Custom Encoding

```js
encode('ride: dreams burn down', 'ascii')
decode('cmlkZTogZHJlYW1zIGJ1cm4gZG93bg', 'ascii')
```

## License

ISC
