import { randomBytes } from "crypto";
import { SessionIDGenError } from "../errors.js";

export async function newSessionID(): Promise<{
  id: string;
  err: SessionIDGenError | null;
}> {
  return new Promise<{
    id: string;
    err: SessionIDGenError | null;
  }>((resolve) => {
    randomBytes(16, (err, buf) => {
      if (err) {
        resolve({ id: "", err: new SessionIDGenError({ cause: err }) });
        return;
      }
      resolve({ id: buf.toString("hex"), err: null });
    });
  });
}
