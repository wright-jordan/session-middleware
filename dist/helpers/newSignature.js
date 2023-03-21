import { createHmac } from "crypto";
export function newSignature(id, secret) {
    return createHmac("sha256", secret).update(id, "hex").digest("hex");
}
