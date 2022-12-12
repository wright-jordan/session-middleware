/// <reference types="node" />
/** Validates an HMAC-SHA256 signature. Expects both parameters to be hex-encoded strings. */
export declare function checkSig(signedID: string, secret: Buffer): [id: string, sig: string, ok: boolean];
