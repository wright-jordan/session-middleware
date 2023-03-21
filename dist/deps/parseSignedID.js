import { checkSignature } from "../helpers/checkSignature.js";
import { parse } from "cookie";
import { BadSignatureError } from "../errors.js";
import { newSignature } from "../helpers/newSignature.js";
import { newSessionID } from "../helpers/newSessionID.js";
import { validateSignedID } from "../helpers/validateSignedID.js";
export async function parseSignedID(secrets, req) {
    const cookieHeader = req.headers["cookie"];
    if (!cookieHeader) {
        const { id, err } = await newSessionID();
        if (err) {
            return { id, sig: "", isNew: false, errors: [err] };
        }
        return { id, sig: newSignature(id, secrets[0]), isNew: true, errors: [] };
    }
    const cookies = parse(cookieHeader);
    const signedID = cookies["sid"];
    if (!signedID) {
        const { id, err } = await newSessionID();
        if (err) {
            return { id, sig: "", isNew: false, errors: [err] };
        }
        return { id, sig: newSignature(id, secrets[0]), isNew: true, errors: [] };
    }
    const validateSIDResult = validateSignedID(signedID);
    if (!validateSIDResult.ok) {
        const errors = [new BadSignatureError(null)];
        const { id, err } = await newSessionID();
        if (err) {
            errors.push(err);
            return { id, sig: "", isNew: false, errors };
        }
        return { id, sig: newSignature(id, secrets[0]), isNew: true, errors };
    }
    let checkSignatureResult = checkSignature(validateSIDResult.id, validateSIDResult.sig, secrets[0]);
    if (checkSignatureResult.ok) {
        return {
            id: validateSIDResult.id,
            sig: checkSignatureResult.sig,
            isNew: false,
            errors: [],
        };
    }
    let sig = checkSignatureResult.sig;
    for (let i = 1; i < secrets.length; i++) {
        // TODO: checkSignatureResult.sig goes unused here.
        // Maybe write a second function to handle this section?
        checkSignatureResult = checkSignature(validateSIDResult.id, validateSIDResult.sig, secrets[i]);
        if (checkSignatureResult.ok) {
            return { id: validateSIDResult.id, sig, isNew: false, errors: [] };
        }
    }
    const errors = [new BadSignatureError(null)];
    const { id, err } = await newSessionID();
    if (err) {
        errors.push(err);
        return { id, sig: "", isNew: false, errors };
    }
    return { id, sig: newSignature(id, secrets[0]), isNew: true, errors };
}
