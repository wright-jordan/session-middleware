import type * as tsHTTP from "ts-http";
import { serialize } from "cookie";
import type { SessionOptions, Store } from "../types.js";

export async function updateSession(
  store: Store,
  oldSession: string,
  ctx: tsHTTP.Context,
  opts: SessionOptions
) {
  const updatedSession = JSON.stringify(ctx.session);
  if (oldSession !== updatedSession) {
    await store.update(ctx.session.sid, updatedSession);
  }
  ctx.cookies.push(
    serialize("sid", ctx.session.sid, {
      maxAge: opts.idleTimeout,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env["NODE_ENV"] !== "development",
    })
  );
}
