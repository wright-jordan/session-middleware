import { createHmac } from "crypto";
export function newSig(id, secret) {
    return createHmac("sha256", secret).update(id, "hex").digest("hex");
}
