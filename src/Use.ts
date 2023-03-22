import { SessionError, RandomBytesError, StoreGetError } from "./errors.js";
import type { SessionMiddleware } from "./types/SessionMiddleware.js";
import type * as tsHTTP from "ts-http";
import { isDeepStrictEqual } from "util";
import cookie from "cookie";
import { newSignature } from "./helpers/newSignature.js";
import * as _ from "cookies-middleware";
import type { SessionData } from "./types/SessionData.js";
import type { IncomingMessage } from "http";

export function Use(deps: {
  parseSignedID: (
    secrets: Buffer[],
    req: IncomingMessage
  ) => Promise<{
    id: string;
    sig: string;
    isNew: boolean;
    errors: SessionError[];
  }>;
}) {
  return function use(
    this: SessionMiddleware,
    next: tsHTTP.Handler
  ): tsHTTP.Handler {
    return async (req, res, ctx) => {
      const parseSignedIDResult = await deps.parseSignedID(
        this.config.secrets,
        req
      );
      if (parseSignedIDResult.errors.length > 0) {
        ctx.session.errors = ctx.session.errors.concat(
          structuredClone(parseSignedIDResult.errors)
        );
        for (const err of ctx.session.errors) {
          if (err instanceof RandomBytesError) {
            await next(req, res, ctx);
            return;
          }
        }
      }
      let storeGetResult: {
        data: SessionData | null;
        err: StoreGetError | null;
      } | null = null;
      if (!parseSignedIDResult.isNew) {
        storeGetResult = await this.config.store.get(
          parseSignedIDResult.id,
          this.config.idleTimeout
        );
        if (storeGetResult.err) {
          ctx.session.errors.push(storeGetResult.err);
          await next(req, res, ctx);
          return;
        }
      }
      ctx.session.id = parseSignedIDResult.id;
      let oldData: SessionData | null = null;
      if (storeGetResult && storeGetResult.data) {
        oldData = storeGetResult.data;
        ctx.session.data = structuredClone(oldData);
      } else {
        ctx.session.data.absoluteDeadline =
          Math.floor(Date.now() / 1000) + this.config.absoluteTimeout;
        oldData = structuredClone(ctx.session.data);
      }
      await next(req, res, ctx);
      if (res.headersSent) {
        return;
      }
      let isOldSig: boolean = false;
      if (ctx.session.id !== parseSignedIDResult.id) {
        isOldSig = true;
        const err = await this.config.store.delete(parseSignedIDResult.id);
        if (err) {
          this.config.handleStoreDeleteError(req, err);
        }
      }
      if (isOldSig || !isDeepStrictEqual(ctx.session.data, oldData)) {
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
            ? newSignature(ctx.session.id, this.config.secrets[0]!)
            : parseSignedIDResult.sig
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
