/// <reference types="node" />
export declare function checkSig(signedID: string, secret: Buffer): {
    id: string;
    sig: string;
    ok: boolean;
};
