import { parseSID } from "./helpers/parseSID.js";
import { SessionIDGenError, } from "./errors.js";
import { isDeepStrictEqual } from "util";
import cookie from "cookie";
import { newSig } from "./helpers/newSig.js";
function use(next) {
    return async (req, res, ctx) => {
        const parseSIDResult = await parseSID(this.config.secrets, req);
        if (parseSIDResult.errors.length > 0) {
            ctx.session.errors = structuredClone(parseSIDResult.errors);
            for (const err of ctx.session.errors) {
                if (err instanceof SessionIDGenError) {
                    await next(req, res, ctx);
                    return;
                }
            }
        }
        const storeGetResult = await this.config.store.get(parseSIDResult.id, this.config.idleTimeout, this.config.absoluteTimeout);
        ctx.session.id = parseSIDResult.id;
        ctx.session.data = structuredClone(storeGetResult.data);
        if (storeGetResult.err) {
            ctx.session.errors.push(storeGetResult.err);
        }
        await next(req, res, ctx);
        if (res.headersSent) {
            return;
        }
        let isOldSig = false;
        if (ctx.session.id !== parseSIDResult.id) {
            isOldSig = true;
            const err = await this.config.store.delete(parseSIDResult.id);
            if (err) {
                this.config.handleStoreDeleteError(err);
            }
        }
        // Note: regenerated session id won't be saved unless session data is modified.
        if (!isDeepStrictEqual(ctx.session.data, storeGetResult.data)) {
            const err = await this.config.store.set(ctx.session.id, ctx.session.data, this.config.idleTimeout);
            if (err) {
                this.config.handleStoreSetError(err);
            }
        }
        const cookieString = cookie.serialize(this.config.cookie.name, `${ctx.session.id}.${isOldSig
            ? newSig(ctx.session.id, this.config.secrets[0])
            : parseSIDResult.sig}`, {
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
