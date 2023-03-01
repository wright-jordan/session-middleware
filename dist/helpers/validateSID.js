function isHex(s) {
    return s
        .split("")
        .every((ch) => [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
    ].includes(ch));
}
export function validateSID(signedID) {
    const [id, sig] = signedID.split(".", 2);
    if (!id || !sig) {
        return { id: "", sig: "", ok: false };
    }
    if (sig.length !== 64) {
        return { id: "", sig: "", ok: false };
    }
    if (id.length !== 32 || !isHex(id) || !isHex(sig)) {
        return { id: "", sig: "", ok: false };
    }
    return { id, sig, ok: true };
}
