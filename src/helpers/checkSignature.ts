import { createHmac, timingSafeEqual } from "crypto";

export function checkSignature(
  id: string,
  sig: string,
  secret: Buffer
): { sig: string; ok: boolean } {
  const generatedSignature = createHmac("sha256", secret)
    .update(id, "hex")
    .digest();
  if (!timingSafeEqual(Buffer.from(sig, "hex"), generatedSignature)) {
    return { sig: generatedSignature.toString("hex"), ok: false };
  }
  return { sig, ok: true };
}
