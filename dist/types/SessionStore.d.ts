import type { SessionData } from "./SessionData.js";
import type { StoreDeleteError, StoreGetError, StoreSetError } from "../errors.js";
export interface SessionStore {
    get(id: string, ttl: number): Promise<{
        data: SessionData | null;
        err: StoreGetError | null;
    }>;
    set(id: string, data: SessionData, ttl: number): Promise<StoreSetError | null>;
    delete(id: string): Promise<StoreDeleteError | null>;
}
