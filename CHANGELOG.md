# Changelog

## 3.0.1 — Unreleased

### Added

- CI and npm version badges in the README.

### Changed

- Move packed-package and Git-install checks into `test/` and remove the `scripts/` directory.
- Run sourcemap cleanup in the tsup configuration and declaration renaming inline in the build command, preserving the generated package contents.

## 3.0.0 — 2026-10-06

### Breaking changes

- Require Node.js 24 or newer.
- Expose the package root and `package.json` through an exports map; internal file imports are no longer supported.
- Reject all non-string `decode` inputs with `TypeError`, including numbers, booleans, objects, `Buffer`, and `Uint8Array`, instead of implicitly coercing them. Convert buffers containing encoded text to strings before decoding.
- Add an enumerable `default` property and a non-enumerable `__esModule` marker to CommonJS exports. The default object and the `require()` result hold the same function references but do not share property replacements.
- Browser bundles relying on Buffer polyfills may no longer build or run. The package targets Node.js only and now imports its `Buffer` API and uses native `base64url` support.

### Added

- `isCanonical(value)` to validate canonical, unpadded Base64url, including unused trailing bits, returning a boolean for any input value.
- `decodeStrict(input, encoding?)` for decoding canonical input, with `SyntaxError` for non-canonical strings.
- `decodeBytes(input)` for lossless binary decoding to an independent `Uint8Array`, retaining Node's permissive Base64 behavior.
- Preserve the concrete `ArrayBuffer` backing type in byte-decoding declarations on TypeScript 5.7 and newer. Older supported compilers infer plain `Uint8Array`; results and their subarrays remain compatible with Blob and WebCrypto types in both cases.
- ESM named and default imports alongside CommonJS `require` support.
- Separate ESM and CommonJS TypeScript declarations with self-contained encoding and byte-input types.
- Tests for Unicode, binary input, custom encodings, padding, permissive decoding, and packed-package consumers.
- Regression tests for non-string decoding and CommonJS export shape, plus a Git-install smoke test in CI.
- A `prepare` build for npm Git installations, with matching npm and pnpm overrides for the patched esbuild version.

### Changed

- Build both module formats from one TypeScript source using tsup.
- Use Node's native Base64url encoding and decoding while preserving the existing four-method API and encoding behavior.
- Follow the is-json development setup with pnpm, Biome, Vitest, and GitHub Actions.
- Enforce 100% coverage and validate runtime and TypeScript consumers before publishing.
- Replace Travis, Coveralls, Tape, NYC, Standard, and the pre-commit hook with the new toolchain.
- Clarify the Node.js-only runtime target and document native `Buffer` alternatives.
- Preserve the `node:buffer` import in both builds and remove duplicate sourcemap comments without changing source mappings.
