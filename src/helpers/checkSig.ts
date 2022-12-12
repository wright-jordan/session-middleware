import { createHmac, timingSafeEqual } from "crypto";

/** Validates an HMAC-SHA256 signature. Expects both parameters to be hex-encoded strings. */
export function checkSig(
  signedID: string,
  secret: Buffer
): [id: string, sig: string, ok: boolean] {
  try {
    const [id, sig] = signedID.split(".", 2);
    if (!id || !sig) {
      return ["", "", false];
    }
    const generatedSig = createHmac("sha256", secret)
      .update(id, "hex")
      .digest();
    if (!timingSafeEqual(Buffer.from(sig, "hex"), generatedSig)) {
      return ["", "", false];
    }
    return [id, sig, true];
  } catch (error) {
    return ["", "", false];
  }
}
