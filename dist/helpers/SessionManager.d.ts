/// <reference types="node" />
/// <reference types="node" />
import type { IncomingMessage } from "http";
interface SessionManager {
    parseSID(secret: Buffer, req: IncomingMessage): [id: string, sig: string];
}
export declare const sessionManager: SessionManager;
export {};
