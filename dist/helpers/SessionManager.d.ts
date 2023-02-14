/// <reference types="node" />
/// <reference types="node" />
import type { IncomingMessage } from "http";
import { SessionError } from "../errors.js";
declare function parseSID(secrets: Buffer[], req: IncomingMessage): Promise<{
    id: string;
    errors: SessionError[];
}>;
interface SessionManager {
    parseSID: typeof parseSID;
}
export declare const sessionManager: SessionManager;
export {};
