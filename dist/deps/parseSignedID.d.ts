/// <reference types="node" />
/// <reference types="node" />
import type * as http from "http";
import { MultiError, SessionError } from "../errors.js";
export declare function parseSignedID(secrets: Buffer[], req: http.IncomingMessage): Promise<{
    id: string;
    sig: string;
    isNew: boolean;
    err: MultiError<SessionError> | null;
}>;
