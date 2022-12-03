import type * as tsHTTP from "ts-http";
import { parse } from "cookie";
import { createHmac } from "crypto";
import type * as _ from "cookies-middleware";
import type { Options, SessionData, Store } from "./types.js";
import { updateSession } from "./helpers/updateSession.js";
import { handleTimeout } from "./helpers/handleTimeout.js";

declare module "ts-http" {
  interface Context {
    session: SessionData;
  }
}

function Session(store: Store) {
  function use(next: tsHTTP.Handler, opts: Options): tsHTTP.Handler {
    return async function sessionMiddleware(req, res, ctx) {
      try {
        // get cookie header and parse
        const cookieString = req.headers.cookie;
        if (!cookieString) {
          await handleTimeout(store, next, req, res, ctx, opts);
          return;
        }
        const cookie = parse(cookieString);

        // get sid from cookie object
        const sid = cookie["sid"];
        if (!sid) {
          await handleTimeout(store, next, req, res, ctx, opts);
          return;
        }

        // split sid into plain id + mac
        const [rawID, mac] = sid.split(".", 2);
        if (!rawID || !mac) {
          res.statusCode = 400;
          res.end();
          return;
        }

        // verify mac
        // TODO: mv to fn that throws BadRequestError,
        // or use regex test to verify isHex
        const generatedMAC = createHmac("sha256", opts.secret)
          .update(rawID, "hex")
          .digest("hex");
        if (mac !== generatedMAC) {
          res.statusCode = 400;
          res.end();
          return;
        }

        // read session from store
        const sessionString = await store.read(sid);
        if (!sessionString) {
          await handleTimeout(store, next, req, res, ctx, opts);
          return;
        }
        ctx.session = JSON.parse(sessionString) as SessionData;

        // handle request
        await next(req, res, ctx);
        if (res.headersSent) {
          return;
        }

        // check for session updates
        updateSession(store, sessionString, ctx, opts).catch(console.error);
      } catch (error) {
        console.error(error);
        res.statusCode = 501;
        res.end();
      }
    };
  }

  return {
    use,
  };
}

export { Session };
