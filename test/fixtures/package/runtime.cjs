const assert = require("node:assert/strict");
const { Buffer } = require("node:buffer");
const base64url = require("base64-url");

assert.equal(base64url.encode("Hello, 🌍"), "SGVsbG8sIPCfjI0");
assert.equal(base64url.decode("SGVsbG8sIPCfjI0"), "Hello, 🌍");
assert.equal(base64url.encode(new Uint8Array([251, 255])), "-_8");
assert.equal(base64url.escape("+/8="), "-_8");
assert.equal(base64url.unescape("-_8"), "+/8=");

const methods = [
	"decode",
	"decodeBytes",
	"decodeStrict",
	"encode",
	"escape",
	"isCanonical",
	"unescape",
];
assert.deepEqual(Object.keys(base64url).sort(), [
	"decode",
	"decodeBytes",
	"decodeStrict",
	"default",
	"encode",
	"escape",
	"isCanonical",
	"unescape",
]);
assert.deepEqual(Object.keys(base64url.default).sort(), methods);
assert.notEqual(base64url, base64url.default);
assert.equal(base64url.__esModule, true);
assert.equal(
	Object.getOwnPropertyDescriptor(base64url, "__esModule")?.enumerable,
	false
);
for (const method of methods) {
	assert.equal(base64url[method], base64url.default[method]);
	assert.equal(
		Object.getOwnPropertyDescriptor(base64url, method)?.writable,
		true
	);
}

assert.equal(base64url.isCanonical(""), true);
assert.equal(base64url.isCanonical("Zg"), true);
assert.equal(base64url.decodeStrict("Zg"), "f");
assert.equal(base64url.decodeStrict("_w", "hex"), "ff");
for (const input of ["Zh", "Zg==", "A", "+/8", " Zg"]) {
	assert.equal(base64url.isCanonical(input), false);
	assert.throws(() => base64url.decodeStrict(input), SyntaxError);
}

const bytes = base64url.decodeBytes("+/8=");
const otherBytes = base64url.decodeBytes("+/8=");
assert.deepEqual(bytes, new Uint8Array([251, 255]));
assert.equal(Object.getPrototypeOf(bytes), Uint8Array.prototype);
assert.equal(Buffer.isBuffer(bytes), false);
assert.notEqual(bytes.buffer, otherBytes.buffer);
bytes[0] = 0;
assert.deepEqual(otherBytes, new Uint8Array([251, 255]));
assert.deepEqual(base64url.decodeBytes("Zg=="), new Uint8Array([102]));

for (const input of [
	Buffer.from("SGVsbG8"),
	new Uint8Array([83, 71]),
	[83, 71],
	new ArrayBuffer(2),
	null,
	{},
]) {
	assert.equal(base64url.isCanonical(input), false);
	assert.throws(() => base64url.decode(input), TypeError);
	assert.throws(() => base64url.default.decode(input), TypeError);
	assert.throws(() => base64url.decodeStrict(input), TypeError);
	assert.throws(() => base64url.default.decodeStrict(input), TypeError);
	assert.throws(() => base64url.decodeBytes(input), TypeError);
	assert.throws(() => base64url.default.decodeBytes(input), TypeError);
}
