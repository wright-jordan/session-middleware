import type { parseSID } from "./deps/parseSID.js";
import type { SessionMiddleware } from "./types/SessionMiddleware.js";
import type * as tsHTTP from "ts-http";
export declare function Use(deps: {
    parseSID: typeof parseSID;
}): (this: SessionMiddleware, next: tsHTTP.Handler) => tsHTTP.Handler;
