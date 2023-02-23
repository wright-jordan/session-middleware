import { createHmac, timingSafeEqual } from "crypto";

export function checkSig(
  signedID: string,
  secret: Buffer
): { id: string; sig: string; ok: boolean } {
  try {
   // TODO: check should be moved to parseSID,
   // don't iterate on something that never passes.
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
    // Validate hex encoding and byte lengths before checkSig loop.
    // Don't iterate on something that will never pass.
    return { id: "", sig: "", ok: false };
  }
}
