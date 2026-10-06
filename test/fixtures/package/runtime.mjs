import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import base64url, {
	decode,
	decodeBytes,
	decodeStrict,
	encode,
	escape as escapeBase64,
	isCanonical,
	unescape as unescapeBase64,
} from "base64-url";

assert.equal(encode("Hello, 🌍"), "SGVsbG8sIPCfjI0");
assert.equal(decode("SGVsbG8sIPCfjI0"), "Hello, 🌍");
assert.equal(encode(new Uint8Array([251, 255])), "-_8");
assert.equal(escapeBase64("+/8="), "-_8");
assert.equal(unescapeBase64("-_8"), "+/8=");
assert.deepEqual(base64url, {
	encode,
	decode,
	decodeBytes,
	decodeStrict,
	isCanonical,
	escape: escapeBase64,
	unescape: unescapeBase64,
});

assert.equal(isCanonical(""), true);
assert.equal(isCanonical("Zg"), true);
assert.equal(decodeStrict("Zg"), "f");
assert.equal(decodeStrict("_w", "hex"), "ff");
for (const input of ["Zh", "Zg==", "A", "+/8", " Zg"]) {
	assert.equal(isCanonical(input), false);
	assert.throws(() => decodeStrict(input), SyntaxError);
}

const bytes = decodeBytes("+/8=");
const otherBytes = decodeBytes("+/8=");
assert.deepEqual(bytes, new Uint8Array([251, 255]));
assert.equal(Object.getPrototypeOf(bytes), Uint8Array.prototype);
assert.equal(Buffer.isBuffer(bytes), false);
assert.notEqual(bytes.buffer, otherBytes.buffer);
bytes[0] = 0;
assert.deepEqual(otherBytes, new Uint8Array([251, 255]));
assert.deepEqual(decodeBytes("Zg=="), new Uint8Array([102]));

for (const input of [
	Buffer.from("SGVsbG8"),
	new Uint8Array([83, 71]),
	[83, 71],
	new ArrayBuffer(2),
	null,
	{},
]) {
	assert.equal(isCanonical(input), false);
	assert.throws(() => decode(input), TypeError);
	assert.throws(() => base64url.decode(input), TypeError);
	assert.throws(() => decodeStrict(input), TypeError);
	assert.throws(() => base64url.decodeStrict(input), TypeError);
	assert.throws(() => decodeBytes(input), TypeError);
	assert.throws(() => base64url.decodeBytes(input), TypeError);
}
