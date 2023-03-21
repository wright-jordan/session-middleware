/// <reference types="node" />
/// <reference types="node" />
import type { IncomingMessage } from "http";
import { SessionError } from "../errors.js";
export declare function parseSignedID(secrets: Buffer[], req: IncomingMessage): Promise<{
    id: string;
    sig: string;
    isNew: boolean;
    errors: SessionError[];
}>;
