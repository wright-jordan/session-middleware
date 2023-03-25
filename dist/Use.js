import { RandomBytesError, } from "./errors.js";
import * as util from "util";
import cookie from "cookie";
import { newSignature } from "./helpers/newSignature.js";
import "cookies-middleware";
export function Use(deps) {
    return function use(next) {
        return async (req, res, ctx) => {
            // TODO: create type Result<T, E extends Error> = [T, E];
            const parseSignedIDResult = await deps.parseSignedID(this.config.secrets, req);
            if (parseSignedIDResult.err) {
                ctx.session.err.set(...parseSignedIDResult.err.list());
                if (ctx.session.err.has(RandomBytesError)) {
                    await next(req, res, ctx);
                    return;
                }
            }
            let storeGetResult = null;
            if (!parseSignedIDResult.isNew) {
                storeGetResult = await this.config.store.get(parseSignedIDResult.id, this.config.idleTimeout);
                if (storeGetResult.err) {
                    ctx.session.err.set(storeGetResult.err);
                    await next(req, res, ctx);
                    return;
                }
            }
            ctx.session.id = parseSignedIDResult.id;
            let oldData = null;
            if (storeGetResult && storeGetResult.data) {
                oldData = storeGetResult.data;
                ctx.session.data = structuredClone(oldData);
            }
            else {
                ctx.session.data.absoluteDeadline =
                    Math.floor(Date.now() / 1000) + this.config.absoluteTimeout;
                oldData = structuredClone(ctx.session.data);
            }
            await next(req, res, ctx);
            if (res.headersSent) {
                return;
            }
            let isOldSig = false;
            if (ctx.session.id !== parseSignedIDResult.id) {
                isOldSig = true;
                const err = await this.config.store.delete(parseSignedIDResult.id);
                if (err) {
                    this.config.handleStoreDeleteError(req, err);
                }
            }
            if (isOldSig || !util.isDeepStrictEqual(ctx.session.data, oldData)) {
                const err = await this.config.store.set(ctx.session.id, ctx.session.data, this.config.idleTimeout);
                if (err) {
                    this.config.handleStoreSetError(req, err);
                }
            }
            const cookieString = cookie.serialize(this.config.cookie.name, `${ctx.session.id}.${isOldSig
                ? newSignature(ctx.session.id, this.config.secrets[0])
                : parseSignedIDResult.sig}`, {
                domain: this.config.cookie.domain,
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 400,
                path: this.config.cookie.path,
                sameSite: this.config.cookie.sameSite,
                secure: this.config.cookie.secure,
            });
            ctx.cookies.push(cookieString);
        };
    };
}
