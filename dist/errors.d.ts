export declare class SessionError extends Error {
    constructor(opts: ErrorOptions | null);
}
export declare class BadSigError extends SessionError {
    constructor(opts: ErrorOptions | null);
}
export declare class StoreGetError extends SessionError {
    constructor(opts: ErrorOptions | null);
}
export declare class StoreSetError extends SessionError {
    constructor(opts: ErrorOptions);
}
export declare class StoreDeleteError extends SessionError {
    constructor(opts: ErrorOptions);
}
export declare class NewSessionError extends SessionError {
    constructor(opts: ErrorOptions | null);
}
