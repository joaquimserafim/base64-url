import base64url, { decodeBytes } from "base64-url";

// Preserve inference: annotating bytes as Uint8Array would erase its backing type.
const bytes = decodeBytes("Zg");
const backing: ArrayBuffer = bytes.buffer;
const source: BufferSource = bytes;
new Blob([bytes, backing, bytes.subarray()]);
crypto.subtle.digest("SHA-256", source);
crypto.subtle.digest("SHA-256", bytes);
crypto.subtle.digest("SHA-256", bytes.subarray());

const defaultBytes = base64url.decodeBytes("Zg");
const defaultBacking: ArrayBuffer = defaultBytes.buffer;
new Blob([defaultBytes, defaultBacking, defaultBytes.subarray()]);
crypto.subtle.digest("SHA-256", defaultBytes);
crypto.subtle.digest("SHA-256", defaultBytes.subarray());
