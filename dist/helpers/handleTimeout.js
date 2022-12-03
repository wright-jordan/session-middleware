import { createSession } from "./createSession.js";
import { updateSession } from "./updateSession.js";
export async function handleTimeout(store, next, req, res, ctx, opts) {
    const sid = await createSession(store, opts);
    ctx.session = { sid };
    const sessionString = JSON.stringify(ctx.session);
    await next(req, res, ctx);
    await updateSession(store, sessionString, ctx, opts);
}
