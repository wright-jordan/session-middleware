import type { IncomingMessage, ServerResponse } from "http";
import type * as tsHTTP from "ts-http";
import type { Options } from "../types.js";
import { createSession } from "./createSession.js";
import { updateSession } from "./updateSession.js";
import type { Store } from "../types.js";

export async function handleTimeout(
  store: Store,
  next: tsHTTP.Handler,
  req: IncomingMessage,
  res: ServerResponse,
  ctx: tsHTTP.Context,
  opts: Options
) {
  const sid = await createSession(store, opts);
  ctx.session = { sid };
  const sessionString = JSON.stringify(ctx.session);
  await next(req, res, ctx);
  await updateSession(store, sessionString, ctx, opts);
}
