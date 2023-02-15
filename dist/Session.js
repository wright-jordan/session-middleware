import { Use } from "./Use.js";
import { parseSID } from "./deps/parseSID.js";
const use = Use({ parseSID });
export function Session(config) {
    return {
        config,
        use,
    };
}
