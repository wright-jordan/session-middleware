/// <reference types="node" />
/** Validates a hex encoded HMAC-SHA256 signature. */
export declare function checkSig(signedID: string, secret: Buffer): {
    id: string;
    ok: boolean;
};
