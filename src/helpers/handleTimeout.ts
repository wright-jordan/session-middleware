import type { IncomingMessage, ServerResponse } from "http";
import type * as tsHTTP from "ts-http";
import type { SessionOptions } from "../types.js";
import { createSession } from "./createSession.js";
import { updateSession } from "./updateSession.js";
import type { Store } from "../types.js";

export async function handleTimeout(
  store: Store,
  next: tsHTTP.Handler,
  req: IncomingMessage,
  res: ServerResponse,
  ctx: tsHTTP.Context,
  opts: SessionOptions
) {
  const sid = await createSession(store, opts);
  ctx.session = { sid };
  const sessionString = JSON.stringify(ctx.session);
  await next(req, res, ctx);
  updateSession(store, sessionString, ctx, opts).catch(console.error);
}
