import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import base64url, {
	decode,
	decodeBytes,
	decodeStrict,
	type Encoding,
	encode,
	escape,
	isCanonical,
	unescape,
} from "../src/index.js";

const vectors = [
	["", ""],
	["f", "Zg"],
	["fo", "Zm8"],
	["foo", "Zm9v"],
	["foob", "Zm9vYg"],
	["fooba", "Zm9vYmE"],
	["foobar", "Zm9vYmFy"],
] as const;

describe("encode and decode", () => {
	it.each(vectors)("matches the RFC 4648 vector for %j", (text, encoded) => {
		expect(encode(text)).toBe(encoded);
		expect(decode(encoded)).toBe(text);
		expect(isCanonical(encoded)).toBe(true);
		expect(decodeStrict(encoded)).toBe(text);
		expect(decodeBytes(encoded)).toEqual(new Uint8Array(Buffer.from(text)));
	});

	it("encodes Unicode and embedded NULs as UTF-8 by default", () => {
		const text = "日本語 😀\u0000 café";
		const encoded = "5pel5pys6KqeIPCfmIAAIGNhZsOp";

		expect(encode(text)).toBe(encoded);
		expect(decode(encoded)).toBe(text);
		expect(decodeStrict(encoded)).toBe(text);
		expect(encode(text, "utf8")).toBe(encoded);
		expect(decode(encoded, "utf8")).toBe(text);
	});

	it("uses the URL-safe alphabet and omits padding", () => {
		expect(encode(Buffer.from([0xfb, 0xff]))).toBe("-_8");
		expect(encode(Buffer.from([0xfb, 0xff, 0xff]))).toBe("-___");
		expect(decode("-_8", "hex")).toBe("fbff");
		expect(decode("-___", "hex")).toBe("fbffff");
	});

	it("round-trips every byte without text decoding", () => {
		const bytes = Uint8Array.from({ length: 256 }, (_, value) => value);
		const encoded = encode(bytes);

		expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
		expect(decode(encoded, "hex")).toBe(Buffer.from(bytes).toString("hex"));
	});

	it("encodes only the selected Uint8Array subarray", () => {
		const bytes = new Uint8Array([0x61, 0xfb, 0xff, 0x62]);
		const input = bytes.subarray(1, 3);

		expect(encode(input)).toBe("-_8");
		expect(bytes).toEqual(new Uint8Array([0x61, 0xfb, 0xff, 0x62]));
	});

	it("encodes only the selected Buffer subarray", () => {
		const bytes = Buffer.from([0x61, 0xfb, 0xff, 0x62]);

		expect(encode(bytes.subarray(1, 3))).toBe("-_8");
		expect(bytes).toEqual(Buffer.from([0x61, 0xfb, 0xff, 0x62]));
	});

	it("accepts empty binary inputs", () => {
		expect(encode(new Uint8Array())).toBe("");
		expect(encode(Buffer.alloc(0))).toBe("");
	});
});

describe("decoder input types", () => {
	const nonStringInputs: [string, unknown][] = [
		["a Buffer", Buffer.from("Zm9v")],
		["a Uint8Array", new Uint8Array([90, 109, 57, 118])],
		["an ArrayBuffer", new Uint8Array([90, 109, 57, 118]).buffer],
		["an array", [90, 109, 57, 118]],
		["a number", 42],
		["a bigint", 42n],
		["true", true],
		["false", false],
		["null", null],
		["undefined", undefined],
		["a symbol", Symbol("Zm9v")],
		["a function", () => "Zm9v"],
		["a plain object", {}],
		["a boxed string", Object("Zm9v")],
		["an object with valueOf", { valueOf: () => "Zm9v" }],
		["an object with toString", { toString: () => "Zm9v" }],
		[
			"an object with Symbol.toPrimitive",
			{ [Symbol.toPrimitive]: () => "Zm9v" },
		],
		["a Buffer JSON object", { type: "Buffer", data: [90, 109, 57, 118] }],
	];

	it.each(nonStringInputs)("rejects %s", (_label, input) => {
		expect(() => decode(input as string)).toThrow(
			new TypeError("Expected a string")
		);
		expect(() => decodeStrict(input as string)).toThrow(
			new TypeError("Expected a string")
		);
		expect(() => decodeBytes(input as string)).toThrow(
			new TypeError("Expected a string")
		);
		expect(isCanonical(input)).toBe(false);
	});
});

describe("custom encodings", () => {
	const encodingVectors: [Encoding, string, string][] = [
		["hex", "e9ff00", "6f8A"],
		["latin1", "éÿ\u0000", "6f8A"],
		["binary", "éÿ\u0000", "6f8A"],
		["utf16le", "AΩ", "QQCpAw"],
		["ucs2", "AΩ", "QQCpAw"],
		["utf-8", "é", "w6k"],
		["ascii", "hello", "aGVsbG8"],
		["base64", "+/8=", "-_8"],
		["base64url", "-_8", "-_8"],
	];

	it.each(encodingVectors)(
		"uses %s for both input and output",
		(encoding, text, encoded) => {
			expect(encode(text, encoding)).toBe(encoded);
			expect(decode(encoded, encoding)).toBe(text);
			expect(decodeStrict(encoded, encoding)).toBe(text);
		}
	);

	it("preserves Node's high-bit behavior for ASCII", () => {
		expect(encode("ÿ", "ascii")).toBe("_w");
		expect(decode("_w", "ascii")).toBe("\u007f");
		expect(decode("_w", "latin1")).toBe("ÿ");
	});

	it("ignores the string encoding when the input is binary", () => {
		expect(encode(new Uint8Array([0xe9]), "utf8")).toBe("6Q");
		expect(encode(Buffer.from([0xe9]), "hex")).toBe("6Q");
	});

	it("retains the UTF-8 fallback for a falsy encoding from JavaScript", () => {
		const encoding = "" as Encoding;

		expect(encode("é", encoding)).toBe("w6k");
		expect(decode("w6k", encoding)).toBe("é");
		expect(decodeStrict("w6k", encoding)).toBe("é");
	});

	it("rejects unsupported string encodings", () => {
		const encoding = "not-an-encoding" as Encoding;

		expect(() => encode("foo", encoding)).toThrow(TypeError);
		expect(() => decode("Zm9v", encoding)).toThrow(TypeError);
		expect(() => decodeStrict("Zm9v", encoding)).toThrow(TypeError);
	});
});

describe("escape", () => {
	it.each([
		["", ""],
		["Zm9v", "Zm9v"],
		["Zg==", "Zg"],
		["Zm8=", "Zm8"],
		["+/8=", "-_8"],
		["+/+/==", "-_-_"],
		["This+is/goingto+escape==", "This-is_goingto-escape"],
	])("converts %j to %j", (input, expected) => {
		expect(escape(input)).toBe(expected);
	});

	it("retains its permissive string transformation", () => {
		expect(escape("a=b==c\n +/!")).toBe("abc\n -_!");
	});
});

describe("unescape", () => {
	it.each([
		["", ""],
		["Z", "Z==="],
		["Zg", "Zg=="],
		["Zm8", "Zm8="],
		["Zm9v", "Zm9v"],
		["Zg=", "Zg=="],
		["Zg==", "Zg=="],
		["Zm8=", "Zm8="],
		["-_8", "+/8="],
		["-_-_", "+/+/"],
		["This-is_goingto-escape", "This+is/goingto+escape=="],
	])("converts %j to %j", (input, expected) => {
		expect(unescape(input)).toBe(expected);
	});

	it("restores padding for each valid byte-length remainder", () => {
		for (const [text, encoded] of vectors) {
			expect(unescape(encoded)).toBe(
				Buffer.from(text).toString("base64")
			);
		}
	});
});

describe("permissive decoding", () => {
	it.each([
		"Zg==",
		"Zg=",
		"+/8=",
		"-_8=",
		" Z m 9 v \n",
		"Zm9v$YmFy",
		"Zg====ignored",
		"!!!!",
		"Z",
		"=Zm9v",
	])("matches Buffer's Base64 decoding for %j", (input) => {
		expect(decode(input, "hex")).toBe(
			Buffer.from(input, "base64").toString("hex")
		);
		expect(decodeBytes(input)).toEqual(
			new Uint8Array(Buffer.from(input, "base64"))
		);
	});

	it("uses replacement characters for invalid UTF-8 by default", () => {
		expect(decode("_w")).toBe("\ufffd");
	});
});

describe("canonical Base64url", () => {
	it.each([
		"Z",
		"abcde",
		"Zg=",
		"Zg==",
		"Zm9v=",
		"+w",
		"/w",
		"ab+c",
		"ab/c",
		"Z g",
		" Zg",
		"Zg ",
		"abc\n",
		"Zg\n",
		"Zg\r",
		"Zg\r\n",
		"Zg\t",
		" \t\r\n",
		"Zg\u0000",
		"Zg\u00a0",
		"Zg\u2028",
		"éé",
		"日本",
		"😀",
		"Zg\ud800",
		"a!",
		"a.",
		"a:",
		"a[",
		"a`",
		"a{",
	])("rejects noncanonical input %j", (input) => {
		expect(isCanonical(input)).toBe(false);
		expect(() => decodeStrict(input)).toThrow(
			new SyntaxError("Expected canonical unpadded Base64url")
		);
	});

	it.each([
		["Zh", "Zg", "66"],
		["Zm9", "Zm8", "666f"],
		["_x", "_w", "ff"],
	])("rejects nonzero unused bits in %j", (alias, canonical, hex) => {
		expect(decode(alias, "hex")).toBe(hex);
		expect(decodeBytes(alias)).toEqual(
			new Uint8Array(Buffer.from(hex, "hex"))
		);
		expect(isCanonical(alias)).toBe(false);
		expect(() => decodeStrict(alias)).toThrow(SyntaxError);
		expect(isCanonical(canonical)).toBe(true);
		expect(decodeStrict(canonical, "hex")).toBe(hex);
	});

	it.each(["A", "AA"])(
		"checks all 64 final sextets after prefix %j against a native oracle",
		(prefix) => {
			const alphabet =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
			for (const character of alphabet) {
				const input = prefix + character;
				const bytes = Buffer.from(input, "base64url");
				const canonical = bytes.toString("base64url");

				expect(isCanonical(input), input).toBe(input === canonical);
				if (input === canonical) {
					expect(decodeStrict(input, "hex")).toBe(
						bytes.toString("hex")
					);
				} else {
					expect(() => decodeStrict(input)).toThrow(SyntaxError);
				}
			}
		}
	);

	it("accepts every alphabet character in a complete group", () => {
		const alphabet =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

		expect(isCanonical(alphabet)).toBe(true);
		expect(decodeStrict(alphabet, "base64url")).toBe(alphabet);
	});

	it("validates Base64url without requiring valid UTF-8", () => {
		expect(isCanonical("_w")).toBe(true);
		expect(decodeStrict("_w")).toBe("\ufffd");
		expect(decodeStrict("_w", "latin1")).toBe("ÿ");
	});
});

describe("decodeBytes", () => {
	it("returns all 256 byte values as a plain Uint8Array", () => {
		const bytes = Uint8Array.from({ length: 256 }, (_, value) => value);
		const decoded = decodeBytes(encode(bytes));

		expect(decoded).toEqual(bytes);
		expect(Object.getPrototypeOf(decoded)).toBe(Uint8Array.prototype);
		expect(Buffer.isBuffer(decoded)).toBe(false);
		expect(decoded.byteOffset).toBe(0);
		expect(decoded.buffer.byteLength).toBe(decoded.byteLength);
	});

	it("round-trips a subarray without adjacent bytes", () => {
		const backing = new Uint8Array([0x61, 0xfb, 0xff, 0x62]);
		const decoded = decodeBytes(encode(backing.subarray(1, 3)));

		expect(decoded).toEqual(new Uint8Array([0xfb, 0xff]));
		decoded[0] = 0;
		expect(backing).toEqual(new Uint8Array([0x61, 0xfb, 0xff, 0x62]));
		expect(decodeBytes("-_8")).toEqual(new Uint8Array([0xfb, 0xff]));
	});

	it("preserves invalid UTF-8 without replacement characters", () => {
		expect(decodeBytes("_w")).toEqual(new Uint8Array([0xff]));
		expect(decodeBytes("wyg")).toEqual(new Uint8Array([0xc3, 0x28]));
		expect(decode("wyg")).toBe("\ufffd(");
	});

	it("returns an independent backing store for each call", () => {
		const first = decodeBytes("Zg");
		const second = decodeBytes("Zg");

		expect(first.buffer).not.toBe(second.buffer);
		expect(first.buffer.byteLength).toBe(1);
		first[0] = 0;
		expect(second[0]).toBe(0x66);
	});
});

describe("module surface", () => {
	it("exposes the named functions through the default export", () => {
		expect(base64url).toEqual({
			encode,
			decode,
			escape,
			unescape,
			isCanonical,
			decodeStrict,
			decodeBytes,
		});
		expect(base64url.encode("foo")).toBe("Zm9v");
		expect(base64url.decode("Zm9v")).toBe("foo");
		expect(base64url.escape("+/8=")).toBe("-_8");
		expect(base64url.unescape("-_8")).toBe("+/8=");
		expect(base64url.isCanonical("-_8")).toBe(true);
		expect(base64url.decodeStrict("-_8", "hex")).toBe("fbff");
		expect(base64url.decodeBytes("-_8")).toEqual(
			new Uint8Array([0xfb, 0xff])
		);
	});
});
