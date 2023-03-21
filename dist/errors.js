export class SessionError extends Error {
    constructor(opts) {
        super("", opts ?? { cause: null });
    }
}
export class BadSignatureError extends SessionError {
    constructor(opts) {
        super(opts);
    }
}
export class StoreGetError extends SessionError {
    constructor(opts) {
        super(opts);
    }
}
export class StoreSetError extends SessionError {
    constructor(opts) {
        super(opts);
    }
}
export class StoreDeleteError extends SessionError {
    constructor(opts) {
        super(opts);
    }
}
export class RandomBytesError extends SessionError {
    constructor(opts) {
        super(opts);
    }
}
