
class Ok<T> {
	public readonly value: T;

	constructor(value: T) {
		this.value = value;
	}
}

class Err<E> {
	public readonly error: E;

	constructor(error: E) {
		this.error = error;
	}
}

class Result<T, E> {
	public readonly ok?: T;
	public readonly error?: E;

	constructor(ok?: T, error?: E) {
		this.ok = ok;
		this.error = error;
	}

	get is_ok(): boolean {
		return this.ok !== undefined;
	}

	get is_err(): boolean {
		return this.ok !== undefined;
	}
}
