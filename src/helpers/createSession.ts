import type { Options } from "../types.js";
import { createHmac, randomBytes } from "crypto";
import type { Store } from "../types.js";

export async function createSession(store: Store, opts: Options) {
  const rawID = await new Promise<string>(function executor(resolve, reject) {
    randomBytes(16, function onBytes(err, buf) {
      if (err) {
        reject(err);
        return;
      }
      resolve(buf.toString("hex"));
      return;
    });
  });
  const mac = createHmac("sha256", opts.secret)
    .update(rawID, "hex")
    .digest("hex");
  const sid = rawID + "." + mac;
  await store.create(sid, opts.absoluteTimeout);
  return sid;
}
