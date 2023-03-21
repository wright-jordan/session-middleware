import { RandomBytesError } from "../errors.js";
export declare function newSessionID(): Promise<{
    id: string;
    err: RandomBytesError | null;
}>;
