import type { parseSID } from "./deps/parseSID.js";
import { SessionIDGenError } from "./errors.js";
import type { SessionMiddleware } from "./types/SessionMiddleware.js";
import type * as tsHTTP from "ts-http";
import { isDeepStrictEqual } from "util";
import cookie from "cookie";
import { newSig } from "./helpers/newSig.js";
import * as _ from "cookies-middleware";

export function Use(deps: { parseSID: typeof parseSID }) {
  return function use(
    this: SessionMiddleware,
    next: tsHTTP.Handler
  ): tsHTTP.Handler {
    return async (req, res, ctx) => {
      const parseSIDResult = await deps.parseSID(this.config.secrets, req);
      if (parseSIDResult.errors.length > 0) {
        ctx.session.errors = structuredClone(parseSIDResult.errors);
        for (const err of ctx.session.errors) {
          if (err instanceof SessionIDGenError) {
            await next(req, res, ctx);
            return;
          }
        }
      }
      const storeGetResult = await this.config.store.get(
        parseSIDResult.id,
        this.config.idleTimeout
      );
      if (storeGetResult.err) {
        ctx.session.errors.push(storeGetResult.err);
        await next(req, res, ctx);
        return;
      }
      ctx.session.id = parseSIDResult.id;
      if (storeGetResult.data) {
        ctx.session.data = structuredClone(storeGetResult.data);
      } else {
        ctx.session.data.absoluteDeadline =
          Math.floor(Date.now() / 1000) + this.config.absoluteTimeout;
        storeGetResult.data = structuredClone(ctx.session.data);
      }
      await next(req, res, ctx);
      if (res.headersSent) {
        return;
      }
      let isOldSig: boolean = false;
      if (ctx.session.id !== parseSIDResult.id) {
        isOldSig = true;
        const err = await this.config.store.delete(parseSIDResult.id);
        if (err) {
          this.config.handleStoreDeleteError(req, err);
        }
      }
      if (!isDeepStrictEqual(ctx.session.data, storeGetResult.data)) {
        const err = await this.config.store.set(
          ctx.session.id,
          ctx.session.data,
          this.config.idleTimeout
        );
        if (err) {
          this.config.handleStoreSetError(req, err);
        }
      }
      const cookieString = cookie.serialize(
        this.config.cookie.name,
        `${ctx.session.id}.${
          isOldSig
            ? newSig(ctx.session.id, this.config.secrets[0]!)
            : parseSIDResult.sig
        }`,
        {
          domain: this.config.cookie.domain,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 400,
          path: this.config.cookie.path,
          sameSite: this.config.cookie.sameSite,
          secure: this.config.cookie.secure,
        }
      );
      ctx.cookies.push(cookieString);
    };
  };
}
