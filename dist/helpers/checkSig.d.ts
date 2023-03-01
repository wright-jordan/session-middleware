/// <reference types="node" />
export declare function checkSig(id: string, sig: string, secret: Buffer): {
    sig: string;
    ok: boolean;
};
