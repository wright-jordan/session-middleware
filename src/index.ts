import type * as tsHTTP from "ts-http";

function use(next: tsHTTP.Handler): tsHTTP.Handler {
  return async function sessionMiddleware(req, res, ctx) {
    await next(req, res, ctx);
  };
}

function Session() {
  return {
    use,
  };
}

export { Session };
