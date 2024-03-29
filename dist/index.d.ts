import type { SessionError, BadSignatureError, RandomBytesError, StoreDeleteError, StoreGetError, StoreSetError, MultiError } from "./errors.js";
import type { SessionData } from "./types/SessionData.js";
import type { SessionConfig } from "./types/SessionConfig.js";
import type { SessionMiddleware } from "./types/SessionMiddleware.js";
import type { SessionStore } from "./types/SessionStore.js";
import { Session } from "./Session.js";
interface SessionContext {
    id: string;
    data: SessionData;
    err: MultiError<SessionError>;
}
declare module "ts-http" {
    interface Context {
        session: SessionContext;
    }
}
export { SessionError, BadSignatureError, RandomBytesError, StoreDeleteError, StoreGetError, StoreSetError, };
export { SessionConfig, SessionData, SessionMiddleware, SessionStore };
export { Session };
