import { createHmac, timingSafeEqual } from "crypto";

export function checkSig(
  signedID: string,
  secret: Buffer
): { id: string; sig: string; ok: boolean } {
  try {
   // TODO, maybe: this check should be moved to parseSID,
   // so that a sig is always returned.
    const [id, sig] = signedID.split(".", 2);
    if (!id || !sig) {
      return { id: "", sig: "", ok: false };
    }
    const generatedSig = createHmac("sha256", secret)
      .update(id, "hex")
      .digest();
    // TODO: generatedSig should be returned.
    if (!timingSafeEqual(Buffer.from(sig, "hex"), generatedSig)) {
      return { id: "", sig: "", ok: false };
    }
    return { id, sig, ok: true };
  } catch (error) {
    return { id: "", sig: "", ok: false };
  }
}
