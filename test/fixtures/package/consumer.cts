import base64url = require("base64-url");

const encoded: string = base64url.encode("Hello", "utf8");
const decoded: string = base64url.decode(encoded, "utf8");
base64url.encode(new Uint8Array([251, 255]));
base64url.escape(decoded);
base64url.unescape(encoded);
const bytes: Uint8Array = base64url.decodeBytes(encoded);
const strictText: string = base64url.decodeStrict(encoded, "utf8");
base64url.encode(bytes);
base64url.isCanonical(strictText);

function decodeUnknown(value: unknown): string | undefined {
	if (typeof value === "string" && base64url.isCanonical(value)) {
		const canonical: string = value;
		return base64url.decodeStrict(canonical);
	}
	if (base64url.isCanonical(value)) {
		// @ts-expect-error Boolean validation alone does not narrow unknown input.
		base64url.decodeStrict(value);
	}
	return undefined;
}
decodeUnknown(encoded);

// @ts-expect-error A number array is not a byte array.
base64url.encode([251, 255]);
// @ts-expect-error The CommonJS declaration also validates encodings.
base64url.encode("Hello", "invalid-encoding");
// @ts-expect-error Decoding requires a string.
base64url.decode(new Uint8Array([251, 255]));
// @ts-expect-error Strict decoding requires encoded text.
base64url.decodeStrict(bytes);
// @ts-expect-error Strict decoding checks encoding names.
base64url.decodeStrict(encoded, "invalid-encoding");
// @ts-expect-error Byte decoding requires encoded text.
base64url.decodeBytes(bytes);
// @ts-expect-error Byte decoding has no text encoding option.
base64url.decodeBytes(encoded, "hex");
// @ts-expect-error Byte decoding returns bytes, not text.
base64url.decodeBytes(encoded).toUpperCase();
// @ts-expect-error The return type is Uint8Array without Buffer overloads.
bytes.toString("hex");
