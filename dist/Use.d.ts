/// <reference types="node" />
/// <reference types="node" />
import { SessionError, MultiError } from "./errors.js";
import type { SessionMiddleware } from "./types/SessionMiddleware.js";
import type * as tsHTTP from "ts-http";
import type { IncomingMessage } from "http";
export declare function Use(deps: {
    parseSignedID: (secrets: Buffer[], req: IncomingMessage) => Promise<{
        id: string;
        sig: string;
        isNew: boolean;
        err: MultiError<SessionError> | null;
    }>;
}): (this: SessionMiddleware, next: tsHTTP.Handler) => tsHTTP.Handler;
