import type { SessionStore } from "./SessionStore.js";
import type { StoreDeleteError, StoreSetError } from "../errors.js";
import type { IncomingMessage } from "http";

export interface SessionConfig {
  cookie: {
    name: string;
    domain?: string;
    path?: string;
    sameSite: "lax" | "strict";
    secure: boolean;
  };
  idleTimeout: number;
  absoluteTimeout: number;
  secrets: Buffer[];
  store: SessionStore;
  handleStoreSetError: (req: IncomingMessage, err: StoreSetError) => void;
  handleStoreDeleteError: (req: IncomingMessage, err: StoreDeleteError) => void;
}
