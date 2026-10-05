export function unescape(str: string): string;
export function escape(str: string): string;
export function encode(str: string | Buffer, encoding?: BufferEncoding): string;
export function decode(str: string, encoding?: BufferEncoding): string;

declare const base64url: {
  unescape: typeof unescape;
  escape: typeof escape;
  encode: typeof encode;
  decode: typeof decode;
};

export default base64url;
