/// <reference types="node" />
import type * as tsHTTP from "ts-http";
declare module "ts-http" {
    interface Context {
        sessionID: string;
        sessionData: SessionData;
    }
}
export type SessionErrorCode = "Store#get" | "Store#set";
export declare class SessionError extends Error {
    code: SessionErrorCode;
    constructor(msg: string, code: SessionErrorCode, opts: ErrorOptions);
}
export interface SessionData {
    _absoluteDeadline: number;
}
export interface SessionStore {
    get(id: string): Promise<[SessionData, SessionError | null]>;
    set(id: string, sess: SessionData): Promise<SessionError | null>;
}
export interface SessionConfig {
    secret: Buffer;
    store: SessionStore;
    log(...v: unknown[]): void;
}
export interface SessionMiddleware {
    config: SessionConfig;
    use(this: SessionMiddleware, next: tsHTTP.Handler): tsHTTP.Handler;
}
export declare function Session(config: SessionConfig): SessionMiddleware;
