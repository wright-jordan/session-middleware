import { createHmac } from "crypto";

export function newSignature(id: string, secret: Buffer): string {
  return createHmac("sha256", secret).update(id, "hex").digest("hex");
}
