import type * as tsHTTP from "ts-http";
import type { Options, Store } from "../types.js";
export declare function updateSession(store: Store, oldSession: string, ctx: tsHTTP.Context, opts: Options): Promise<void>;
