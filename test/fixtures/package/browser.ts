import base64url, {
	decode,
	decodeBytes,
	decodeStrict,
	type Encoding,
	encode,
	isCanonical,
} from "base64-url";

const encoding: Encoding = "utf8";
const bytes = new TextEncoder().encode("Hello, 🌍");
const encoded: string = encode(bytes, encoding);
const decoded: string = decode(encoded, encoding);
base64url.encode(decoded);
const decodedBytes = decodeBytes(encoded);
const backing: ArrayBuffer = decodedBytes.buffer;
const strictText: string = decodeStrict(encoded, encoding);
new TextDecoder().decode(decodedBytes);
new Blob([decodedBytes, backing, decodedBytes.subarray()]);
crypto.subtle.digest("SHA-256", decodedBytes);
crypto.subtle.digest("SHA-256", decodedBytes.subarray());
const defaultBytes = base64url.decodeBytes(encoded);
new Blob([defaultBytes]);
crypto.subtle.digest("SHA-256", defaultBytes);
base64url.decodeStrict(encoded, encoding);
base64url.isCanonical(strictText);

function decodeUnknown(value: unknown): string | undefined {
	if (typeof value === "string" && isCanonical(value)) {
		const canonical: string = value;
		return decodeStrict(canonical);
	}
	if (isCanonical(value)) {
		// @ts-expect-error Boolean validation alone does not narrow unknown input.
		decodeStrict(value);
	}
	return undefined;
}
decodeUnknown(encoded);

// @ts-expect-error This consumer deliberately has no ambient Node types.
Buffer.from("Hello");
// @ts-expect-error Browser consumers get checked encoding names too.
encode(bytes, "invalid-encoding");
// @ts-expect-error Strict decoding requires text, not bytes.
decodeStrict(bytes);
// @ts-expect-error Strict decoding validates encoding names.
decodeStrict(encoded, "invalid-encoding");
// @ts-expect-error Byte decoding requires text, not bytes.
decodeBytes(bytes);
// @ts-expect-error Byte decoding does not accept an encoding.
decodeBytes(encoded, "hex");
// @ts-expect-error Byte decoding returns bytes, not text.
decodeBytes(encoded).toUpperCase();
// @ts-expect-error The byte result needs no Node Buffer declarations.
decodedBytes.toString("hex");
