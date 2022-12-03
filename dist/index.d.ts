import type * as tsHTTP from "ts-http";
import type { Options, SessionData, Store } from "./types.js";
declare module "ts-http" {
    interface Context {
        session: SessionData;
    }
}
declare function Session(store: Store): {
    use: (next: tsHTTP.Handler, opts: Options) => tsHTTP.Handler;
};
export { SessionData };
export { Session };
