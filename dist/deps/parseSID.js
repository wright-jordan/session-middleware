import { checkSig } from "../helpers/checkSig.js";
import { parse } from "cookie";
import { BadSigError } from "../errors.js";
import { newSig } from "../helpers/newSig.js";
import { newSessionID } from "../helpers/newSessionID.js";
import { validateSID } from "../helpers/validateSID.js";
export async function parseSID(secrets, req) {
    const cookieHeader = req.headers["cookie"];
    if (!cookieHeader) {
        const { id, err } = await newSessionID();
        if (err) {
            return { id, sig: "", isNew: false, errors: [err] };
        }
        return { id, sig: newSig(id, secrets[0]), isNew: true, errors: [] };
    }
    const cookies = parse(cookieHeader);
    const signedID = cookies["sid"];
    if (!signedID) {
        const { id, err } = await newSessionID();
        if (err) {
            return { id, sig: "", isNew: false, errors: [err] };
        }
        return { id, sig: newSig(id, secrets[0]), isNew: true, errors: [] };
    }
    const validateSIDResult = validateSID(signedID);
    if (!validateSIDResult.ok) {
        const errors = [new BadSigError(null)];
        const { id, err } = await newSessionID();
        if (err) {
            errors.push(err);
            return { id, sig: "", isNew: true, errors };
        }
        return { id, sig: newSig(id, secrets[0]), isNew: true, errors };
    }
    let checkSigResult = checkSig(validateSIDResult.id, validateSIDResult.sig, secrets[0]);
    if (checkSigResult.ok) {
        return {
            id: validateSIDResult.id,
            sig: checkSigResult.sig,
            isNew: false,
            errors: [],
        };
    }
    let sig = checkSigResult.sig;
    for (let i = 1; i < secrets.length; i++) {
        // TODO: checkSigResult.sig goes unused here.
        // Maybe write a second function to handle this section?
        checkSigResult = checkSig(validateSIDResult.id, validateSIDResult.sig, secrets[i]);
        if (checkSigResult.ok) {
            return { id: validateSIDResult.id, sig, isNew: false, errors: [] };
        }
    }
    const errors = [new BadSigError(null)];
    const { id, err } = await newSessionID();
    if (err) {
        errors.push(err);
        return { id, sig: "", isNew: false, errors };
    }
    return { id, sig: newSig(id, secrets[0]), isNew: true, errors };
}
