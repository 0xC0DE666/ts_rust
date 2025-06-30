# TS-Rust

## Rust-like Result and Option Utilities for TypeScript

This library provides TypeScript implementations of `Result<T, E>` and `Option<T>` types, inspired by Rust's error handling and optional value patterns. It offers a robust and expressive way to handle fallible operations and nullable values without relying on `null`, `undefined`, or traditional `try-catch` blocks.

## Features

- **`Option<T>`**: Represents an optional value, which can be either `Some<T>` (containing a value) or `None` (containing no value).
- **`Result<T, E>`**: Represents the result of an operation that can fail, which can be either `Ok<T>` (success, containing a value) or `Err<E>` (error, containing an error value).
- **Type-Safe**: Leverages TypeScript's type system to ensure that you handle both success and error cases.
- **Fluent API**: Provides a chainable, ergonomic API with methods like `map`, `andThen`, and `unwrapOr`.
- **Utility Functions**: Includes `tryCatch` and `asyncTryCatch` to easily convert functions that might throw exceptions into `Result` types.

## Usage

Since this is a single-file library, you can directly import the necessary classes and functions into your Deno project.

```typescript
import { Result, Ok, Err, Option, Some, None, tryCatch, asyncTryCatch } from "./mod.ts";
```

## API

### `Option<T>`

The `Option<T>` type is used to represent a value that may or may not be present.

#### `Some<T>`

Represents the presence of a value.

```typescript
const someValue: Option<number> = new Some(42);

console.assert(someValue.isSome()); // true
console.assert(someValue.unwrap() === 42);
```

#### `None<T>`

Represents the absence of a value.

```typescript
const noValue: Option<number> = new None();

console.assert(noValue.isNone()); // true
// noValue.unwrap(); // Throws an error
```

#### Methods

- `isSome()`: Returns `true` if the option is a `Some`.
- `isNone()`: Returns `true` if the option is a `None`.
- `unwrap()`: Returns the value from a `Some` or throws an error if it's a `None`.
- `unwrapOr(defaultValue: T)`: Returns the value from a `Some` or `defaultValue` if it's a `None`.
- `map<U>(op: (val: T) => U)`: Applies a function to the contained value (if any) and returns a new `Option`.
- `andThen<U>(op: (val: T) => Option<U>)`: Chains a function that returns an `Option` to the contained value (if any).

### `Result<T, E>`

The `Result<T, E>` type is used for operations that can fail.

#### `Ok<T, E>`

Represents a successful result.

```typescript
const success: Result<number, string> = new Ok(100);

console.assert(success.isOk()); // true
console.assert(success.unwrap() === 100);
```

#### `Err<T, E>`

Represents a failure.

```typescript
const error: Result<number, string> = new Err("Something went wrong");

console.assert(error.isErr()); // true
// error.unwrap(); // Throws an error
console.assert(error.unwrapErr() === "Something went wrong");
```

#### Methods

- `isOk()`: Returns `true` if the result is `Ok`.
- `isErr()`: Returns `true` if the result is `Err`.
- `ok()`: Converts a `Result<T, E>` into an `Option<T>`.
- `err()`: Converts a `Result<T, E>` into an `Option<E>`.
- `unwrap()`: Returns the value from an `Ok` or throws an error if it's an `Err`.
- `unwrapErr()`: Returns the error from an `Err` or throws an error if it's an `Ok`.
- `map<U>(op: (val: T) => U)`: Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value.
- `mapErr<F>(op: (err: E) => F)`: Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value.
- `andThen<U>(op: (val: T) => Result<U, E>)`: Chains a function that returns a `Result` to a contained `Ok` value.

### Utility Functions

#### `tryCatch`

Wraps a synchronous function that may throw an error into a `Result`.

```typescript
const result = tryCatch(() => {
  if (Math.random() > 0.5) {
    return "Success!";
  } else {
    throw new Error("Failure!");
  }
});

if (result.isOk()) {
  console.log(result.unwrap());
}
```

#### `asyncTryCatch`

Wraps an asynchronous function that may reject into a `Promise<Result>`.

```typescript
const result = await asyncTryCatch(async () => {
  const response = await fetch("https://api.example.com/data");
  if (!response.ok) {
    throw new Error("Network request failed");
  }
  return response.json();
});
```

## Running Tests

To run the unit tests for this library, use the following Deno command:

```shell
deno test src/test.ts
``` 

## License

MIT License
