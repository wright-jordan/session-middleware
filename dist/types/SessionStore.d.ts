import type { SessionData } from "./SessionData.js";
import type { StoreDeleteError, StoreGetError, StoreSetError } from "../errors.js";
export interface SessionStore {
    get(id: string, ttl: number, absoluteTimeout: number): Promise<{
        data: SessionData;
        err: StoreGetError | null;
    }>;
    set(id: string, sess: SessionData, ttl: number): Promise<StoreSetError | null>;
    delete(id: string): Promise<StoreDeleteError | null>;
}
