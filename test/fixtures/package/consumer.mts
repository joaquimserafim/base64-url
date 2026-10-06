import base64url, {
	decode,
	decodeBytes,
	decodeStrict,
	type Encoding,
	encode,
	escape as escapeBase64,
	isCanonical,
	unescape as unescapeBase64,
} from "base64-url";

const encoding: Encoding = "utf8";
const encoded: string = encode("Hello", encoding);
const decoded: string = decode(encoded, encoding);
base64url.encode(new Uint8Array([251, 255]));
base64url.decode(encoded);
escapeBase64(decoded);
unescapeBase64(encoded);
const bytes: Uint8Array = decodeBytes(encoded);
const strictText: string = decodeStrict(encoded, encoding);
base64url.decodeStrict(encoded, encoding);
base64url.decodeBytes(encoded);
base64url.isCanonical(strictText);
encode(bytes);

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

// @ts-expect-error Only strings and byte arrays are supported.
encode(42);
// @ts-expect-error ArrayBuffer is not a Uint8Array.
encode(new ArrayBuffer(2));
// @ts-expect-error Encoding names are checked.
encode("Hello", "invalid-encoding");
// @ts-expect-error Decoding also checks the encoding.
decode(encoded, "invalid-encoding");
// @ts-expect-error Strict decoding requires text, not bytes.
decodeStrict(bytes);
// @ts-expect-error Strict decoding validates output encoding names.
decodeStrict(encoded, "invalid-encoding");
// @ts-expect-error Byte decoding requires encoded text.
decodeBytes(bytes);
// @ts-expect-error Byte decoding has no text encoding option.
decodeBytes(encoded, "hex");
// @ts-expect-error Byte decoding does not return text.
decodeBytes(encoded).toUpperCase();
// @ts-expect-error Byte decoding returns Uint8Array without Buffer overloads.
bytes.toString("hex");
