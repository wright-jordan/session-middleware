import { sessionManager } from "./helpers/SessionManager.js";
function use(next) {
    return async (req, res, ctx) => {
        // @ts-ignore
        const [id, sig] = sessionManager.parseSID(this.config.secret, req);
        // @ts-ignore
        const [sessionData, err] = await this.config.store.get(id);
        if (err) {
            this.config.log(err.code, err.name, err.message);
            res.statusCode = 501;
            res.end();
            return;
        }
        await next(req, res, ctx);
    };
}
export class SessionError extends Error {
    code;
    constructor(msg, code, opts) {
        super(msg, opts);
        this.code = code;
    }
}
export function Session(config) {
    return {
        config,
        use,
    };
}
