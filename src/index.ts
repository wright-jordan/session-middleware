import type { SessionError } from "./errors.js";
import type { SessionData } from "./types/SessionData.js";
import type { SessionConfig } from "./types/SessionConfig.js";
import type { SessionMiddleware } from "./types/SessionMiddleware.js";
import type { SessionStore } from "./types/SessionStore.js";
import { Session } from "./Session.js";

interface SessionContext {
  id: string;
  data: SessionData;
  errors: SessionError[];
}

declare module "ts-http" {
  interface Context {
    session: SessionContext;
  }
}

// TODO: export error classes
export { SessionConfig, SessionData, SessionMiddleware, SessionStore };
export { Session };
