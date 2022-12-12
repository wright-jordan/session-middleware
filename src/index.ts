import type * as tsHTTP from "ts-http";
import { sessionManager } from "./helpers/SessionManager.js";

declare module "ts-http" {
  interface Context {
    sessionID: string;
    sessionData: SessionData;
  }
}

function use(this: SessionMiddleware, next: tsHTTP.Handler): tsHTTP.Handler {
  return async (req, res, ctx) => {
    // @ts-ignore
    const [id, sig] = sessionManager.parseSID(this.config.secret, req);
    // @ts-ignore
    const [sessionData, err] = await this.config.store.get(id);
    if (err) {
      this.config.log(err.code, err.name, err.message);
      res.statusCode = 501;
      res.end();
      return;
    }
    await next(req, res, ctx);
  };
}

export type SessionErrorCode = "Store#get" | "Store#set";
export class SessionError extends Error {
  code: SessionErrorCode;
  constructor(msg: string, code: SessionErrorCode, opts: ErrorOptions) {
    super(msg, opts);
    this.code = code;
  }
}

export interface SessionData {
  _absoluteDeadline: number;
}

export interface SessionStore {
  get(id: string): Promise<[SessionData, SessionError | null]>;
  set(id: string, sess: SessionData): Promise<SessionError | null>;
}

export interface SessionConfig {
  secret: Buffer;
  store: SessionStore;
  log(...v: unknown[]): void;
}

export interface SessionMiddleware {
  config: SessionConfig;
  use(this: SessionMiddleware, next: tsHTTP.Handler): tsHTTP.Handler;
}

export function Session(config: SessionConfig): SessionMiddleware {
  return {
    config,
    use,
  };
}
