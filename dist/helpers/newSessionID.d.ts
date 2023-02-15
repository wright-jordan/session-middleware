import { SessionIDGenError } from "../errors.js";
export declare function newSessionID(): Promise<{
    id: string;
    err: SessionIDGenError | null;
}>;
