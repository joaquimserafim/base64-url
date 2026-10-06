import { Buffer } from "node:buffer";

/** Encodings supported by Node.js Buffer, without requiring global Node types. */
export type Encoding =
	| "ascii"
	| "utf8"
	| "utf-8"
	| "utf16le"
	| "utf-16le"
	| "ucs2"
	| "ucs-2"
	| "base64"
	| "base64url"
	| "latin1"
	| "binary"
	| "hex";

function assertString(value: unknown): asserts value is string {
	if (typeof value !== "string") {
		throw new TypeError("Expected a string");
	}
}

/** Check for canonical, unpadded Base64url. The empty string is canonical. */
export function isCanonical(value: unknown): boolean {
	if (typeof value !== "string") return false;

	const remainder = value.length % 4;
	if (remainder === 1) return false;

	let last = 0;
	for (let index = 0; index < value.length; index++) {
		const code = value.charCodeAt(index);
		if (code >= 65 && code <= 90) last = code - 65;
		else if (code >= 97 && code <= 122) last = code - 71;
		else if (code >= 48 && code <= 57) last = code + 4;
		else if (code === 45) last = 62;
		else if (code === 95) last = 63;
		else return false;
	}

	// A final partial group must leave its unused low bits clear.
	return (
		remainder === 0 ||
		(remainder === 2 ? (last & 15) === 0 : (last & 3) === 0)
	);
}

/** Restore the standard Base64 alphabet and padding. Does not validate input. */
export function unescape(str: string): string {
	return (str + "===".slice((str.length + 3) % 4))
		.replace(/-/g, "+")
		.replace(/_/g, "/");
}

/** Convert Base64 to its URL-safe alphabet and remove padding. */
export function escape(str: string): string {
	return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/** Encode text or bytes as unpadded Base64url. Encoding applies to text only. */
export function encode(str: string | Uint8Array, encoding?: Encoding): string {
	const bytes =
		typeof str === "string"
			? Buffer.from(str, encoding || "utf8")
			: Buffer.from(str);
	return bytes.toString("base64url");
}

/**
 * Decode Base64url to text using Node.js's permissive Base64 decoder.
 * @throws {TypeError} If the input is not a string.
 */
export function decode(str: string, encoding?: Encoding): string {
	assertString(str);
	return Buffer.from(str, "base64url").toString(encoding || "utf8");
}

/**
 * Decode canonical, unpadded Base64url to text. UTF-8 decoding is permissive.
 * @throws {TypeError} If the input is not a string.
 * @throws {SyntaxError} If the string is not canonical, unpadded Base64url.
 */
export function decodeStrict(str: string, encoding?: Encoding): string {
	assertString(str);
	if (!isCanonical(str)) {
		throw new SyntaxError("Expected canonical unpadded Base64url");
	}
	return decode(str, encoding);
}

/**
 * Decode Base64url permissively to a plain Uint8Array containing the bytes.
 * @throws {TypeError} If the input is not a string.
 */
// slice's return type preserves ArrayBuffer on newer TypeScript versions while
// remaining compatible with versions before typed arrays became generic.
export function decodeBytes(str: string): ReturnType<Uint8Array["slice"]> {
	assertString(str);
	return new Uint8Array(Buffer.from(str, "base64url"));
}

const base64url = {
	unescape,
	escape,
	encode,
	decode,
	isCanonical,
	decodeStrict,
	decodeBytes,
};

export default base64url;
