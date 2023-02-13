import type { IncomingMessage } from "http";
import { checkSig } from "./checkSig.js";
import { parse } from "cookie";
import { randomBytes } from "crypto";
import { BadSigError, NewSessionError, SessionError } from "../errors.js";
import type * as _ from "cookies-middleware";

async function parseSID(
  secret: Buffer,
  req: IncomingMessage
): Promise<{ id: string; errors: SessionError[] }> {
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
  const { id, ok } = checkSig(signedID, secret);
  if (!ok) {
    const errors: SessionError[] = [new BadSigError(null)];
    const { id, err } = await newSessionID();
    if (err) {
      errors.push(err);
      return { id, errors };
    }
    return { id, errors };
  }
  return { id, errors: [] };
}

async function newSessionID(): Promise<{
  id: string;
  err: NewSessionError | null;
}> {
  return new Promise<{
    id: string;
    err: NewSessionError | null;
  }>((resolve) => {
    randomBytes(16, (err, buf) => {
      if (err) {
        resolve({ id: "", err: new NewSessionError({ cause: err }) });
        return;
      }
      resolve({ id: buf.toString("hex"), err: null });
    });
  });
}

interface SessionManager {
  parseSID: typeof parseSID;
}

export const sessionManager: SessionManager = {
  parseSID,
};
