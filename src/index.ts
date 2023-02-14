import type * as tsHTTP from "ts-http";
import { sessionManager } from "./helpers/SessionManager.js";
import {
  NewSessionError,
  SessionError,
  StoreDeleteError,
  StoreGetError,
  StoreSetError,
} from "./errors.js";
import { createHmac } from "crypto";
import { isDeepStrictEqual } from "util";
import cookie from "cookie";

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
      this.config.secrets,
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
    const storeGetResult = await this.config.store.get(
      parseSIDResult.id,
      this.config.idleTimeout
    );
    ctx.session.id = parseSIDResult.id;
    ctx.session.data = structuredClone(storeGetResult.data);
    if (storeGetResult.err) {
      ctx.session.errors.push(storeGetResult.err);
    }
    await next(req, res, ctx);
    if (res.headersSent) {
      return;
    }

    if (ctx.session.id !== parseSIDResult.id) {
      const err = await this.config.store.delete(parseSIDResult.id);
      if (err) {
        this.config.handleStoreDeleteError(err);
      }
    }
    if (
      ctx.session.id !== parseSIDResult.id ||
      !isDeepStrictEqual(ctx.session.data, storeGetResult.data)
    ) {
      const err = await this.config.store.set(
        ctx.session.id,
        ctx.session.data,
        this.config.absoluteTimeout
      );
      if (err) {
        this.config.handleStoreSetError(err);
      }
    }
    const sig = createHmac("sha256", this.config.secrets[0])
      .update(ctx.session.id, "hex")
      .digest("hex");
    const cookieString = cookie.serialize(
      this.config.cookie.name,
      `${ctx.session.id}.${sig}`,
      {
        domain: this.config.cookie.domain,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: this.config.cookie.path,
        sameSite: this.config.cookie.sameSite,
        secure: this.config.cookie.secure,
      }
    );
    ctx.cookies.push(cookieString);
  };
}

export interface SessionData {
  _absoluteDeadline: number;
}

export interface SessionStore {
  get(
    id: string,
    idleTimeout: number
  ): Promise<{ data: SessionData; err: StoreGetError | null }>;
  set(
    id: string,
    sess: SessionData,
    absoluteTimeout: number
  ): Promise<StoreSetError | null>;
  delete(id: string): Promise<StoreDeleteError | null>;
}

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
  secrets: [Buffer, Buffer];
  store: SessionStore;
  handleStoreSetError: (err: StoreSetError) => void;
  handleStoreDeleteError: (err: StoreDeleteError) => void;
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
