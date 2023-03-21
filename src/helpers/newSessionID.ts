import { randomBytes } from "crypto";
import { RandomBytesError } from "../errors.js";

export async function newSessionID(): Promise<{
  id: string;
  err: RandomBytesError | null;
}> {
  return new Promise<{
    id: string;
    err: RandomBytesError | null;
  }>((resolve) => {
    randomBytes(16, (err, buf) => {
      if (err) {
        resolve({ id: "", err: new RandomBytesError({ cause: err }) });
        return;
      }
      resolve({ id: buf.toString("hex"), err: null });
    });
  });
}
