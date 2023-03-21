import { Use } from "./Use.js";
import { parseSignedID } from "./deps/parseSignedID.js";
const use = Use({ parseSignedID });
export function Session(config) {
    return {
        config,
        use,
    };
}
