import type { SessionData } from "./SessionData.js";
import type {
  StoreDeleteError,
  StoreGetError,
  StoreSetError,
} from "../errors.js";

// If store.get can't locate ID, then return null.
// Use.js should then set SessionData.absoluteDeadline.
// SessionContext has already set SessionData to a default value.
export interface SessionStore {
  get(
    id: string,
    ttl: number
  ): Promise<{ data: SessionData | null; err: StoreGetError | null }>;
  set(
    id: string,
    data: SessionData,
    ttl: number
  ): Promise<StoreSetError | null>;
  delete(id: string): Promise<StoreDeleteError | null>;
}
