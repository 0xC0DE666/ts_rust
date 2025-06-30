//
// Result
//

interface IResult<T, E> {
  isOk(): this is Ok<T, E>;
  isErr(): this is Err<E, T>;
  ok(): Option<T>;
  err(): Option<E>;
  unwrap(): T | never;
  unwrapErr(): E | never;
  map<U>(op: (val: T) => U): Result<U, E>;
  mapErr<F>(op: (err: E) => F): Result<T, F>;
  andThen<U>(op: (val: T) => Result<U, E>): Result<U, E>;
}

export class Ok<T, E = never> implements IResult<T, E> {
  constructor(public readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<E, T> {
    return false;
  }

  ok(): Option<T> {
    return new Some(this.value);
  }

  err(): Option<E> {
    return new None();
  }

  unwrap(): T {
    return this.value;
  }

  unwrapErr(): never {
    throw new Error("called `unwrapErr()` on an `Ok` value");
  }

  map<U>(op: (val: T) => U): Result<U, E> {
    return new Ok(op(this.value));
  }

  mapErr<F>(_op: (err: E) => F): Result<T, F> {
    return new Ok(this.value);
  }

  andThen<U>(op: (val: T) => Result<U, E>): Result<U, E> {
    return op(this.value);
  }
}

export class Err<E, T = never> implements IResult<T, E> {
  constructor(public readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<E, T> {
    return true;
  }

  ok(): Option<T> {
    return new None();
  }

  err(): Option<E> {
    return new Some(this.error);
  }

  unwrap(): never {
    throw new Error(`called \`unwrap()\` on an \`Err\` value: ${this.error}`);
  }

  unwrapErr(): E {
    return this.error;
  }

  map<U>(_op: (val: T) => U): Result<U, E> {
    return new Err(this.error);
  }

  mapErr<F>(op: (err: E) => F): Result<T, F> {
    return new Err(op(this.error));
  }

  andThen<U>(_op: (val: T) => Result<U, E>): Result<U, E> {
    return new Err(this.error);
  }
}

export type Result<T, E> = Ok<T, E> | Err<E, T>;

export function tryCatch<T, E = Error>(f: () => T): Result<T, E> {
  try {
    return new Ok(f());
  } catch (e) {
    return new Err(e as E);
  }
}

export async function asyncTryCatch<T, E = Error>(
  f: () => Promise<T>,
): Promise<Result<T, E>> {
  try {
    return new Ok(await f());
  } catch (e) {
    return new Err(e as E);
  }
}

//
// Option
//

interface IOption<T> {
  isSome(): this is Some<T>;
  isNone(): this is None<T>;
  unwrap(): T | never;
  unwrapOr(defaultValue: T): T;
  map<U>(op: (val: T) => U): Option<U>;
  andThen<U>(op: (val: T) => Option<U>): Option<U>;
}

export class Some<T> implements IOption<T> {
  constructor(public readonly value: T) {}

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None<T> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  map<U>(op: (val: T) => U): Option<U> {
    return new Some(op(this.value));
  }

  andThen<U>(op: (val: T) => Option<U>): Option<U> {
    return op(this.value);
  }
}

export class None<T = never> implements IOption<T> {
  isSome(): this is Some<T> {
    return false;
  }

  isNone(): this is None<T> {
    return true;
  }

  unwrap(): never {
    throw new Error("called `unwrap()` on a `None` value");
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  map<U>(_op: (val: T) => U): Option<U> {
    return new None();
  }

  andThen<U>(_op: (val: T) => Option<U>): Option<U> {
    return new None();
  }
}

export type Option<T> = Some<T> | None<T>;
