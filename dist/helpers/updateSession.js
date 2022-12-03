import { serialize } from "cookie";
export async function updateSession(store, oldSession, ctx, opts) {
    const updatedSession = JSON.stringify(ctx.session);
    if (oldSession !== updatedSession) {
        await store.update(ctx.session.sid, updatedSession);
    }
    ctx.cookies.push(serialize("sid", ctx.session.sid, {
        maxAge: opts.idleTimeout,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env["NODE_ENV"] !== "development",
    }));
}
