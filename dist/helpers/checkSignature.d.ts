/// <reference types="node" />
export declare function checkSignature(id: string, sig: string, secret: Buffer): {
    sig: string;
    ok: boolean;
};
