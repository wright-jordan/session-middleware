export declare class SessionError extends Error {
    constructor(opts: ErrorOptions | null);
}
export declare class BadSignatureError extends SessionError {
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
export declare class RandomBytesError extends SessionError {
    constructor(opts: ErrorOptions | null);
}
