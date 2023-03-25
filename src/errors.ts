export class SessionError extends Error {
  constructor(opts: ErrorOptions | null) {
    super("", opts ?? { cause: null });
  }
}

export class BadSignatureError extends SessionError {
  constructor(opts: ErrorOptions | null) {
    super(opts);
  }
}

export class StoreGetError extends SessionError {
  constructor(opts: ErrorOptions | null) {
    super(opts);
  }
}

export class StoreSetError extends SessionError {
  constructor(opts: ErrorOptions) {
    super(opts);
  }
}

export class StoreDeleteError extends SessionError {
  constructor(opts: ErrorOptions) {
    super(opts);
  }
}

export class RandomBytesError extends SessionError {
  constructor(opts: ErrorOptions | null) {
    super(opts);
  }
}

export class MultiError<E extends Error> {
  #errors: E[];

  constructor(...errors: E[]) {
    this.#errors = errors;
  }

  list() {
    return this.#errors;
  }

  has(errClass: new (...args: any[]) => E) {
    return this.#errors.some((err) => err instanceof errClass);
  }

  set(...errs: E[]) {
    this.#errors = this.#errors.concat(errs);
  }
}
