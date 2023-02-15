import type { SessionConfig } from "./SessionConfig.js";
import type * as tsHTTP from "ts-http";
export interface SessionMiddleware {
    config: SessionConfig;
    use(this: SessionMiddleware, next: tsHTTP.Handler): tsHTTP.Handler;
}
