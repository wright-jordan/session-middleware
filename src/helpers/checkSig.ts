import { createHmac, timingSafeEqual } from "crypto";

/** Validates a hex encoded HMAC-SHA256 signature. */
export function checkSig(
  signedID: string,
  secret: Buffer
): { id: string; ok: boolean } {
  try {
    const [id, sig] = signedID.split(".", 2);
    if (!id || !sig) {
      return { id: "", ok: false };
    }
    const generatedSig = createHmac("sha256", secret)
      .update(id, "hex")
      .digest();
    if (!timingSafeEqual(Buffer.from(sig, "hex"), generatedSig)) {
      return { id: "", ok: false };
    }
    return { id, ok: true };
  } catch (error) {
    return { id: "", ok: false };
  }
}
