//
// Result
//

interface IResult<T, E> {
	is_ok(): this is Ok<T, E>;
	is_err(): this is Err<E, T>;
	ok(): Option<T>;
	err(): Option<E>;
	unwrap(): T | never;
	unwrap_err(): E | never;
	map<U>(op: (val: T) => U): Result<U, E>;
	map_err<F>(op: (err: E) => F): Result<T, F>;
	and_then<U>(op: (val: T) => Result<U, E>): Result<U, E>;
}

export class Ok<T, E = never> implements IResult<T, E> {
	constructor(public readonly value: T) {}

	is_ok(): this is Ok<T, E> {
		return true;
	}

	is_err(): this is Err<E, T> {
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

	unwrap_err(): never {
		throw new Error("called `unwrap_err()` on an `Ok` value");
	}

	map<U>(op: (val: T) => U): Result<U, E> {
		return new Ok(op(this.value));
	}

	map_err<F>(_op: (err: E) => F): Result<T, F> {
		return new Ok(this.value);
	}

	and_then<U>(op: (val: T) => Result<U, E>): Result<U, E> {
		return op(this.value);
	}
}

export class Err<E, T = never> implements IResult<T, E> {
	constructor(public readonly error: E) {}

	is_ok(): this is Ok<T, E> {
		return false;
	}

	is_err(): this is Err<E, T> {
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

	unwrap_err(): E {
		return this.error;
	}

	map<U>(_op: (val: T) => U): Result<U, E> {
		return new Err(this.error);
	}

	map_err<F>(op: (err: E) => F): Result<T, F> {
		return new Err(op(this.error));
	}

	and_then<U>(_op: (val: T) => Result<U, E>): Result<U, E> {
		return new Err(this.error);
	}
}

export type Result<T, E> = Ok<T, E> | Err<E, T>;

//
// Option
//

interface IOption<T> {
	is_some(): this is Some<T>;
	is_none(): this is None<T>;
	unwrap(): T | never;
	unwrap_or(default_value: T): T;
	map<U>(op: (val: T) => U): Option<U>;
	and_then<U>(op: (val: T) => Option<U>): Option<U>;
}

export class Some<T> implements IOption<T> {
	constructor(public readonly value: T) {}

	is_some(): this is Some<T> {
		return true;
	}

	is_none(): this is None<T> {
		return false;
	}

	unwrap(): T {
		return this.value;
	}

	unwrap_or(_default_value: T): T {
		return this.value;
	}

	map<U>(op: (val: T) => U): Option<U> {
		return new Some(op(this.value));
	}

	and_then<U>(op: (val: T) => Option<U>): Option<U> {
		return op(this.value);
	}
}

export class None<T = never> implements IOption<T> {
	is_some(): this is Some<T> {
		return false;
	}

	is_none(): this is None<T> {
		return true;
	}

	unwrap(): never {
		throw new Error("called `unwrap()` on a `None` value");
	}

	unwrap_or(default_value: T): T {
		return default_value;
	}

	map<U>(_op: (val: T) => U): Option<U> {
		return new None();
	}

	and_then<U>(_op: (val: T) => Option<U>): Option<U> {
		return new None();
	}
}

export type Option<T> = Some<T> | None<T>; 