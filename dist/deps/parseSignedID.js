import { checkSignature } from "../helpers/checkSignature.js";
import * as cookie from "cookie";
import { BadSignatureError, MultiError } from "../errors.js";
import { newSignature } from "../helpers/newSignature.js";
import { newSessionID } from "../helpers/newSessionID.js";
import { validateSignedID } from "../helpers/validateSignedID.js";
export async function parseSignedID(secrets, req) {
    const cookieHeader = req.headers["cookie"];
    if (!cookieHeader) {
        const { id, err } = await newSessionID();
        if (err) {
            return { id, sig: "", isNew: false, err: new MultiError(err) };
        }
        return { id, sig: newSignature(id, secrets[0]), isNew: true, err: null };
    }
    const cookies = cookie.parse(cookieHeader);
    const signedID = cookies["sid"];
    if (!signedID) {
        const { id, err } = await newSessionID();
        if (err) {
            return { id, sig: "", isNew: false, err: new MultiError(err) };
        }
        return { id, sig: newSignature(id, secrets[0]), isNew: true, err: null };
    }
    const validateSIDResult = validateSignedID(signedID);
    if (!validateSIDResult.ok) {
        const err = new MultiError(new BadSignatureError(null));
        const sessionIDResult = await newSessionID();
        if (sessionIDResult.err) {
            err.set(sessionIDResult.err);
            return { id: sessionIDResult.id, sig: "", isNew: false, err };
        }
        return {
            id: sessionIDResult.id,
            sig: newSignature(sessionIDResult.id, secrets[0]),
            isNew: true,
            err,
        };
    }
    let checkSignatureResult = checkSignature(validateSIDResult.id, validateSIDResult.sig, secrets[0]);
    if (checkSignatureResult.ok) {
        return {
            id: validateSIDResult.id,
            sig: checkSignatureResult.sig,
            isNew: false,
            err: null,
        };
    }
    let sig = checkSignatureResult.sig;
    for (let i = 1; i < secrets.length; i++) {
        // TODO: checkSignatureResult.sig goes unused here.
        // Maybe write a second function to handle this section?
        checkSignatureResult = checkSignature(validateSIDResult.id, validateSIDResult.sig, secrets[i]);
        if (checkSignatureResult.ok) {
            return { id: validateSIDResult.id, sig, isNew: false, err: null };
        }
    }
    const err = new MultiError(new BadSignatureError(null));
    const sessionIDResult = await newSessionID();
    if (sessionIDResult.err) {
        err.set(sessionIDResult.err);
        return { id: sessionIDResult.id, sig: "", isNew: false, err };
    }
    return {
        id: sessionIDResult.id,
        sig: newSignature(sessionIDResult.id, secrets[0]),
        isNew: true,
        err,
    };
}
