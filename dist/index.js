import { sessionManager } from "./helpers/SessionManager.js";
import { NewSessionError, } from "./errors.js";
import { createHmac } from "crypto";
import { isDeepStrictEqual } from "util";
import cookie from "cookie";
function use(next) {
    return async (req, res, ctx) => {
        const parseSIDResult = await sessionManager.parseSID(this.config.secrets, req);
        if (parseSIDResult.errors.length > 0) {
            ctx.session.errors = ctx.session.errors.concat(parseSIDResult.errors);
            for (const err of ctx.session.errors) {
                if (err instanceof NewSessionError) {
                    await next(req, res, ctx);
                    return;
                }
            }
        }
        const storeGetResult = await this.config.store.get(parseSIDResult.id, this.config.idleTimeout);
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
        if (ctx.session.id !== parseSIDResult.id ||
            !isDeepStrictEqual(ctx.session.data, storeGetResult.data)) {
            const err = await this.config.store.set(ctx.session.id, ctx.session.data, this.config.absoluteTimeout);
            if (err) {
                this.config.handleStoreSetError(err);
            }
        }
        const sig = createHmac("sha256", this.config.secrets[0])
            .update(ctx.session.id, "hex")
            .digest("hex");
        const cookieString = cookie.serialize(this.config.cookie.name, `${ctx.session.id}.${sig}`, {
            domain: this.config.cookie.domain,
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
            path: this.config.cookie.path,
            sameSite: this.config.cookie.sameSite,
            secure: this.config.cookie.secure,
        });
        ctx.cookies.push(cookieString);
    };
}
export function Session(config) {
    return {
        config,
        use,
    };
}
