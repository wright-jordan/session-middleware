import type * as tsHTTP from "ts-http";
import { sessionManager } from "./helpers/SessionManager.js";
import {
  NewSessionError,
  SessionError,
  StoreGetError,
  StoreSetError,
} from "./errors.js";
import { createHmac } from "crypto";

declare module "ts-http" {
  interface Context {
    session: Session;
  }
}

interface Session {
  id: string;
  data: SessionData;
  errors: SessionError[];
}

function use(this: SessionMiddleware, next: tsHTTP.Handler): tsHTTP.Handler {
  return async (req, res, ctx) => {
    const parseSIDResult = await sessionManager.parseSID(
      this.config.secret,
      req
    );
    if (parseSIDResult.errors.length > 0) {
      ctx.session.errors = ctx.session.errors.concat(parseSIDResult.errors);
      for (const err of ctx.session.errors) {
        if (err instanceof NewSessionError) {
          await next(req, res, ctx);
          return;
        }
      }
    }
    const storeGetResult = await this.config.store.get(parseSIDResult.id);
    ctx.session.id = parseSIDResult.id;
    ctx.session.data = storeGetResult.data;
    if (storeGetResult.err) {
      ctx.session.errors.push(storeGetResult.err);
    }
    await next(req, res, ctx);
    if (res.headersSent) {
      return;
    }
    const sig = createHmac("sha256", this.config.secret)
      .update(ctx.session.id, "hex")
      .digest("hex");
  };
}

export interface SessionData {
  _absoluteDeadline: number;
}

export interface SessionStore {
  get(id: string): Promise<{ data: SessionData; err: StoreGetError | null }>;
  set(id: string, sess: SessionData): Promise<StoreSetError | null>;
}

// TODO: change secret to a Buffer[] that uses the last secret in the array for new hmacs and checks received hmacs from last to first.
export interface SessionConfig {
  idleTimeout: number;
  absoluteTimeout: number;
  secret: Buffer;
  store: SessionStore;
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
