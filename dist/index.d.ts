/// <reference types="node" />
import type * as tsHTTP from "ts-http";
import { SessionError, StoreDeleteError, StoreGetError, StoreSetError } from "./errors.js";
declare module "ts-http" {
    interface Context {
        session: Session;
    }
}
interface Session {
    id: string;
    data: SessionData;
    errors: SessionError[];
}
export interface SessionData {
    _absoluteDeadline: number;
}
export interface SessionStore {
    get(id: string, idleTimeout: number): Promise<{
        data: SessionData;
        err: StoreGetError | null;
    }>;
    set(id: string, sess: SessionData, absoluteTimeout: number): Promise<StoreSetError | null>;
    delete(id: string): Promise<StoreDeleteError | null>;
}
export interface SessionConfig {
    cookie: {
        name: string;
        domain?: string;
        path?: string;
        sameSite: "lax" | "strict";
        secure: boolean;
    };
    idleTimeout: number;
    absoluteTimeout: number;
    secrets: [Buffer, Buffer];
    store: SessionStore;
    handleStoreSetError: (err: StoreSetError) => void;
    handleStoreDeleteError: (err: StoreDeleteError) => void;
}
export interface SessionMiddleware {
    config: SessionConfig;
    use(this: SessionMiddleware, next: tsHTTP.Handler): tsHTTP.Handler;
}
export declare function Session(config: SessionConfig): SessionMiddleware;
export {};
