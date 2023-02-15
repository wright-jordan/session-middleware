/// <reference types="node" />
/// <reference types="node" />
import type { IncomingMessage } from "http";
import { SessionError } from "../errors.js";
export declare function parseSID(secrets: Buffer[], req: IncomingMessage): Promise<{
    id: string;
    sig: string;
    errors: SessionError[];
}>;
