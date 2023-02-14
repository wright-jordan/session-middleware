import { checkSig } from "./checkSig.js";
import { parse } from "cookie";
import { randomBytes } from "crypto";
import { BadSigError, NewSessionError } from "../errors.js";
async function parseSID(secrets, req) {
    const cookieHeader = req.headers["cookie"];
    if (!cookieHeader) {
        const { id, err } = await newSessionID();
        if (err) {
            return { id, errors: [err] };
        }
        return { id, errors: [] };
    }
    const cookies = parse(cookieHeader);
    const signedID = cookies["sid"];
    if (!signedID) {
        const { id, err } = await newSessionID();
        if (err) {
            return { id, errors: [err] };
        }
        return { id, errors: [] };
    }
    for (const secret of secrets) {
        const checkSigResult = checkSig(signedID, secret);
        if (checkSigResult.ok) {
            return { id: checkSigResult.id, errors: [] };
        }
    }
    const errors = [new BadSigError(null)];
    const { id, err } = await newSessionID();
    if (err) {
        errors.push(err);
        return { id, errors };
    }
    return { id, errors };
}
async function newSessionID() {
    return new Promise((resolve) => {
        randomBytes(16, (err, buf) => {
            if (err) {
                resolve({ id: "", err: new NewSessionError({ cause: err }) });
                return;
            }
            resolve({ id: buf.toString("hex"), err: null });
        });
    });
}
export const sessionManager = {
    parseSID,
};
