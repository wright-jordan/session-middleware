/// <reference types="node" />
import type { IncomingMessage, ServerResponse } from "http";
import type * as tsHTTP from "ts-http";
import type { Options } from "../types.js";
import type { Store } from "../types.js";
export declare function handleTimeout(store: Store, next: tsHTTP.Handler, req: IncomingMessage, res: ServerResponse, ctx: tsHTTP.Context, opts: Options): Promise<void>;
