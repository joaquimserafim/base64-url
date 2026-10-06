import base64url from "base64-url";

if (base64url.encode("Hello") !== "SGVsbG8") {
	throw new Error(
		"The legacy CommonJS default import does not match its declaration."
	);
}

const candidate: unknown = "Zg";
if (
	typeof candidate !== "string" ||
	!base64url.isCanonical(candidate) ||
	base64url.decodeStrict(candidate) !== "f"
) {
	throw new Error("The legacy default import is missing strict decoding.");
}
const bytes: Uint8Array = base64url.decodeBytes("Zg==");
if (Object.getPrototypeOf(bytes) !== Uint8Array.prototype || bytes[0] !== 102) {
	throw new Error("The legacy default import must return plain bytes.");
}

// Compile these negative checks without executing intentionally invalid calls.
export function validateConsumerTypes(value: unknown): void {
	if (typeof value === "string" && base64url.isCanonical(value)) {
		const canonical: string = value;
		const strictText: string = base64url.decodeStrict(canonical, "utf8");
		base64url.encode(strictText);
	}
	if (base64url.isCanonical(value)) {
		// @ts-expect-error Boolean validation alone does not narrow unknown input.
		base64url.decodeStrict(value);
	}
	// @ts-expect-error Strict decoding requires encoded text.
	base64url.decodeStrict(value);
	// @ts-expect-error Strict decoding validates encoding names.
	base64url.decodeStrict("Zg", "invalid-encoding");
	// @ts-expect-error Byte decoding requires encoded text.
	base64url.decodeBytes(value);
	// @ts-expect-error Byte decoding does not accept an encoding.
	base64url.decodeBytes("Zg", "hex");
	// @ts-expect-error Byte decoding returns bytes, not text.
	base64url.decodeBytes("Zg").toUpperCase();
	// @ts-expect-error Uint8Array does not expose Buffer's encoding overload.
	bytes.toString("hex");
}
