import type { IncomingMessage } from "http";
import { checkSig } from "./checkSig.js";
import { parse } from "cookie";
import { BadSigError, SessionError } from "../errors.js";
import { newSig } from "./newSig.js";
import { newSessionID } from "./newSessionID.js";

export async function parseSID(
  secrets: Buffer[],
  req: IncomingMessage
): Promise<{ id: string; sig: string; errors: SessionError[] }> {
  const cookieHeader = req.headers["cookie"];
  if (!cookieHeader) {
    const { id, err } = await newSessionID();
    if (err) {
      return { id, sig: "", errors: [err] };
    }
    return { id, sig: newSig(id, secrets[0]!), errors: [] };
  }
  const cookies = parse(cookieHeader);
  const signedID = cookies["sid"];
  if (!signedID) {
    const { id, err } = await newSessionID();
    if (err) {
      return { id, sig: "", errors: [err] };
    }
    return { id, sig: newSig(id, secrets[0]!), errors: [] };
  }
  let sig: string = "";
  for (let i = 0; i < secrets.length; i++) {
    const checkSigResult = checkSig(signedID, secrets[i]!);
    if (i === 0) {
      sig = checkSigResult.sig;
    }
    if (checkSigResult.ok) {
      return { id: checkSigResult.id, sig, errors: [] };
    }
  }
  const errors: SessionError[] = [new BadSigError(null)];
  const { id, err } = await newSessionID();
  if (err) {
    errors.push(err);
    return { id, sig: "", errors };
  }
  return { id, sig: newSig(id, secrets[0]!), errors };
}
