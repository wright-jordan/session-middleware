import { checkSig } from "./checkSig.js";
import { parse } from "cookie";
import { createHmac, randomBytes } from "crypto";
function parseSID(secret, req) {
    const cookieHeader = req.headers["cookie"];
    if (!cookieHeader) {
        return newSession(secret);
    }
    const cookies = parse(cookieHeader);
    const signedID = cookies["sid"];
    if (!signedID) {
        return newSession(secret);
    }
    const [id, sig, ok] = checkSig(signedID, secret);
    if (!ok) {
        // log event
        return newSession(secret);
    }
    return [id, sig];
}
function newSession(secret) {
    const id = randomBytes(16);
    const sig = createHmac("sha256", secret).update(id).digest();
    return [id.toString("hex"), sig.toString("hex")];
}
export const sessionManager = {
    parseSID,
};
