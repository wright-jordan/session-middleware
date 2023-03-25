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
export class MultiError {
    #errors;
    constructor(...errors) {
        this.#errors = errors;
    }
    list() {
        return this.#errors;
    }
    has(errClass) {
        return this.#errors.some((err) => err instanceof errClass);
    }
    set(...errs) {
        this.#errors = this.#errors.concat(errs);
    }
}
