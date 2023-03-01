import { createHmac, timingSafeEqual } from "crypto";

export function checkSig(
  id: string,
  sig: string,
  secret: Buffer
): { sig: string; ok: boolean } {
  const generatedSig = createHmac("sha256", secret).update(id, "hex").digest();
  if (!timingSafeEqual(Buffer.from(sig, "hex"), generatedSig)) {
    return { sig: generatedSig.toString("hex"), ok: false };
  }
  return { sig, ok: true };
}
