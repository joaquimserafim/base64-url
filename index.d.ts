export type Encodings = 'ascii' | 'utf8' | 'base64' | 'latin1' | 'hex'

export const unescape: (input: string) => string
export const escape: (input: string) => string

export const encode: (input: string, encoding?: Encodings) => string
export const decode: (input: string, encoding?: Encodings) => string
