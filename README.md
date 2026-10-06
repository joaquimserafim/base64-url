# base64-url

Base64url encoding, decoding, canonical validation, and Base64 conversion for **Node.js only**.

Requires **Node.js 24 or newer**. Zero runtime dependencies. Ships ESM and CommonJS builds with TypeScript declarations for each module format.

This package uses Node's built-in `Buffer` API. **Browser runtimes, including Angular client-side applications, are not supported.** ESM support lets Node.js applications use `import`; it does not add browser support.

## Install

```sh
npm install base64-url
# or
pnpm add base64-url
```

## Size

Zero runtime dependencies. What ships in the npm tarball:

| What | Raw | Gzipped |
| --- | ---: | ---: |
| **ESM runtime** (`index.mjs`) | 1 890 B | 705 B |
| **CJS runtime** (`index.cjs`) | 2 154 B | 795 B |
| **Types** (`.d.mts` / `.d.cts`) | 4 232 B | 1 472 B |
| **Sourcemaps** (debug-only) | 12 028 B | 3 977 B |

Your import style selects the ESM or CommonJS build.

Gzipped sizes use Node's default gzip settings. Types and sourcemaps show the sum of both files, compressed individually.

## Usage

### ES modules

```js
import base64url, { encode, decode, escape, unescape } from "base64-url";

encode("Node.js is awesome.");
// "Tm9kZS5qcyBpcyBhd2Vzb21lLg"

decode("Tm9kZS5qcyBpcyBhd2Vzb21lLg");
// "Node.js is awesome."

escape("+/8=");
// "-_8"

unescape("-_8");
// "+/8="

// The default export exposes all seven methods.
base64url.encode("hello");
// "aGVsbG8"
```

### CommonJS

```js
const base64url = require("base64-url");
// Or: const { encode, decode } = require("base64-url");

base64url.encode("hello");
// "aGVsbG8"
```

### Bytes and custom encodings

```js
import { Buffer } from "node:buffer";
import { encode, decode } from "base64-url";

encode(Buffer.from([251, 255]));
// "-_8"

encode(new Uint8Array([251, 255]));
// "-_8"

encode("fbff", "hex");
// "-_8"

decode("-_8", "hex");
// "fbff"

encode("café");
// "Y2Fmw6k" (UTF-8)

encode("café", "latin1");
// "Y2Fm6Q"
```

### Canonical validation and strict decoding

```js
import { isCanonical, decodeStrict } from "base64-url";

isCanonical("Zg");
// true

isCanonical("Zh");
// false: nonzero unused bits, even though Node decodes it to "f"

isCanonical("Zg==");
// false: padding is outside this package's canonical format

decodeStrict("Zg");
// "f"

decodeStrict("Zh");
// throws SyntaxError
```

### Decoding binary data

```js
import { decodeBytes, encode } from "base64-url";

const bytes = decodeBytes("-_8");
// Uint8Array [251, 255]

encode(bytes);
// "-_8"
```

## API

| Method | Input | Returns |
| --- | --- | --- |
| `encode(input, encoding?)` | A string, `Buffer`, or `Uint8Array` | Unpadded Base64url string |
| `decode(input, encoding?)` | Base64url or standard Base64 string | Decoded string |
| `decodeBytes(input)` | Base64url or standard Base64 string | Decoded bytes as a plain `Uint8Array` |
| `isCanonical(value)` | Any value | Whether it is a canonical, unpadded Base64url string |
| `decodeStrict(input, encoding?)` | Canonical, unpadded Base64url string | Decoded string; throws for non-canonical input |
| `escape(input)` | Base64 string | String with `+` changed to `-`, `/` to `_`, and `=` removed |
| `unescape(input)` | Base64url string | Standard Base64 alphabet with padding restored |

`encoding` defaults to `"utf8"`. For `encode`, it specifies the input string's encoding and is ignored for byte inputs. For `decode` and `decodeStrict`, it specifies the output string's encoding. Supported values are `ascii`, `utf8`, `utf-8`, `utf16le`, `utf-16le`, `ucs2`, `ucs-2`, `base64`, `base64url`, `latin1`, `binary`, and `hex`. Encoding handling follows Node's `Buffer` API.

`decode` and `decodeBytes` follow Node's permissive Base64 decoding behavior: they accept either alphabet, optional padding, whitespace, and other content Node ignores. They do not validate the encoded form. `escape` and `unescape` transform strings without validating them.

All three decoders require a primitive string and throw `TypeError` for every other input type, including `Buffer`, `Uint8Array`, and boxed `String` objects. If a Buffer contains encoded text, convert it first: `decode(value.toString("utf8"))`.

`isCanonical` checks the exact unpadded format produced by `encode`: only `A–Z`, `a–z`, `0–9`, `-`, and `_`, a valid length, and zero unused trailing bits. It returns `false` for non-strings, padding, whitespace, junk, and aliases such as `"Zh"` for `"Zg"`. These unused-bit rules come from [RFC 4648's canonical encoding requirements](https://www.rfc-editor.org/rfc/rfc4648.html#section-3.5).

`decodeStrict` applies the same check and throws `SyntaxError` for a non-canonical string. Strictness applies to the Base64url representation, not to UTF-8 validity: `decodeStrict("_w")` returns the replacement character `"\ufffd"`, while `decodeStrict("_w", "hex")` returns `"ff"`.

`decodeBytes` preserves arbitrary binary data without converting it to text and returns a new, independent `Uint8Array`. For strict binary decoding, check `isCanonical(input)` before calling `decodeBytes(input)`.

The empty string is canonical. `isCanonical("")` returns `true`, `decodeBytes("")` returns an empty byte array, and the other methods return an empty string for empty input.

### TypeScript

```ts
import { decodeBytes, encode, isCanonical, type Encoding } from "base64-url";

const encoding: Encoding = "hex";
const result: string = encode("fbff", encoding);

const input: unknown = "-_8";
if (typeof input === "string" && isCanonical(input)) {
  const bytes = decodeBytes(input);
}
```

CommonJS TypeScript consumers can use `import base64url = require("base64-url")`. The package supplies separate `.d.mts` and `.d.cts` declarations. Its public types do not require global Node types or an additional `@types` package.

On TypeScript 5.7 and newer, the inferred `decodeBytes` result retains its `ArrayBuffer` backing type. Older supported compilers infer plain `Uint8Array`. In both cases, the result and its `.subarray()` results can be passed directly to Blob and WebCrypto APIs.

## Migrating from v2

- Upgrade to Node.js 24 or newer.
- Existing `require("base64-url")` calls and the four method names remain supported. String encodings, padding transformations, and permissive decoding behavior are preserved.
- ESM consumers can use named imports or the default import.
- `decode` now rejects all non-string inputs with `TypeError` instead of implicitly coercing them. This includes numbers, booleans, objects, `Buffer`, and `Uint8Array`. For a Buffer containing encoded text, use `decode(value.toString("utf8"))`. Malformed strings still follow Node's permissive decoding behavior.
- CommonJS exports now include an enumerable `default` property and a non-enumerable `__esModule` marker. The `.default` object holds the same function references, but is separate from the `require()` result. Replacing a method on one object does not replace it on the other.
- Browser runtimes are unsupported. Existing browser bundles that relied on Buffer polyfills may no longer build or run: v3 imports Node's `Buffer` and uses its native `base64url` encoding, which older polyfills may not implement.
- Import from `"base64-url"`. Internal paths such as `"base64-url/index.js"` are no longer public entry points. `"base64-url/package.json"` remains available.
- TypeScript declarations are included. Remove a separate `@types/base64-url` installation if you previously used one.

## Native Node.js alternative

For simple encoding and decoding, you can use Node's built-in [`Buffer` API](https://nodejs.org/api/buffer.html#buffers-and-character-encodings) without this package:

```js
import { Buffer } from "node:buffer";

const encoded = Buffer.from("hello", "utf8").toString("base64url");
// "aGVsbG8"

const decoded = Buffer.from(encoded, "base64url").toString("utf8");
// "hello"
```

## Development

Use the pnpm version pinned in `package.json`:

```sh
pnpm install
pnpm check
```

| Command | Purpose |
| --- | --- |
| `pnpm typecheck` | Check source and test types |
| `pnpm lint` | Check formatting and lint rules without modifying files |
| `pnpm format` | Apply formatting and safe lint fixes |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Enforce 100% statement, branch, function, and line coverage |
| `pnpm build` | Build ESM, CommonJS, declarations, and source maps in `dist/` |
| `pnpm test:package` | Pack and install the build in a temporary consumer, then verify runtime and TypeScript imports |
| `pnpm test:git` | Install a temporary Git snapshot with npm and verify that it builds and imports correctly; requires Git and registry access unless dependencies are cached |
| `pnpm check` | Run type, lint, coverage, build, and packed-package checks |

CI runs `pnpm check` on Node 24.0.0, the latest Node 24 release, and the current Node release. The latest Node 24 job also runs `pnpm test:git`. Coverage reports are generated locally in `coverage/`; no external coverage token is needed.

Before publishing, run `pnpm check` and `pnpm test:git`. The `prepare` script builds `dist/` during local dependency installation, packing, and npm Git dependency installation. Registry packages ship the prebuilt files. Publishing requires pnpm and runs `pnpm check` through `prepublishOnly`. Only `dist/`, the README, license, and package metadata are published.

## Alternatives

- [base64url](https://github.com/brianloveswords/base64url)

## License

ISC © 2014-2026 [@joaquimserafim](https://github.com/joaquimserafim).
