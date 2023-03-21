import { randomBytes } from "crypto";
import { RandomBytesError } from "../errors.js";
export async function newSessionID() {
    return new Promise((resolve) => {
        randomBytes(16, (err, buf) => {
            if (err) {
                resolve({ id: "", err: new RandomBytesError({ cause: err }) });
                return;
            }
            resolve({ id: buf.toString("hex"), err: null });
        });
    });
}
