# TS-Rust

Rust-like `Result<T, E>` and `Option<T>` for TypeScript / Deno.

This library gives you expressive, type-safe error handling and optional values
without leaning on `null`/`undefined` or raw `try/catch`.

## Features

- **`Result<T, E>`** — explicit success (`Ok`) or failure (`Err`)
- **`Option<T>`** — explicit presence (`Some`) or absence (`None`)
- **Ergonomic factories** — `ok()`, `err()`, `some()`, `none()` (preferred over
  `new`)
- **Fluent API** — `map`, `andThen`, `mapErr`, `unwrapOr`, `expect`, `match`,
  etc.
- **Practical helpers** — `tryCatch` / `asyncTryCatch` to turn throwing
  functions into `Result`
- **Zero dependencies**, strict TypeScript, works great in Deno

## Installation & Usage

```typescript
// Deno
import {
	asyncTryCatch,
	err,
	none,
	ok,
	Result,
	some,
	tryCatch,
} from "jsr:@0xc0de666/ts-rust";

// or local import
// import { ok, err, some, none } from "./mod.ts";
```

**Recommended style (factories):**

```typescript
const user = ok({ id: 1, name: "Ada" });
const missing = none<string>();
const error = err("Not found");
```

You can still use the classes directly if you prefer:

```typescript
import { Err, None, Ok, Some } from "./mod.ts";

const user = new Ok({ id: 1 });
```

## Quick Start

```typescript
import { err, ok, tryCatch } from "./mod.ts";

// Happy path
const result = ok(42)
	.map((n) => n * 2)
	.andThen((n) => ok(`The answer is ${n}`));

console.log(result.unwrap()); // "The answer is 84"

// Error path
const failure = err("boom")
	.mapErr((e) => `Error: ${e}`);

console.log(failure.unwrapErr()); // "Error: boom"

// Convert throwing code
const parsed = tryCatch(() => JSON.parse('{"valid": true}'));
if (parsed.isOk()) {
	console.log("Parsed:", parsed.unwrap());
}
```

See the runnable examples in the [`examples/`](./examples/) directory:

- `examples/basic-result.ts`
- `examples/basic-option.ts`

Run them with:

```bash
deno run examples/basic-result.ts
deno run examples/basic-option.ts
```

## API

### `Option<T>`

| Method                  | `Some<T>`                | `None<T>`       |
| ----------------------- | ------------------------ | --------------- |
| `isSome()`              | `true`                   | `false`         |
| `isNone()`              | `false`                  | `true`          |
| `unwrap()`              | returns value            | throws          |
| `unwrapOr(default)`     | returns value            | returns default |
| `unwrapOrElse(fn)`      | returns value            | calls fn        |
| `expect(msg)`           | returns value            | throws with msg |
| `map(fn)`               | `Some(fn(value))`        | `None`          |
| `andThen(fn)`           | `fn(value)`              | `None`          |
| `or(other)`             | `this`                   | `other`         |
| `orElse(fn)`            | `this`                   | `fn()`          |
| `match(onSome, onNone)` | `onSome(value)`          | `onNone()`      |
| `flatten()`             | inner Option (if nested) | `None`          |

**Factories**

```ts
some(42); // Some<number>
none<number>(); // None<number>
```

### `Result<T, E>`

| Method               | `Ok<T, E>`      | `Err<E, T>`      |
| -------------------- | --------------- | ---------------- |
| `isOk()`             | `true`          | `false`          |
| `isErr()`            | `false`         | `true`           |
| `unwrap()`           | returns value   | throws           |
| `unwrapErr()`        | throws          | returns error    |
| `unwrapOrElse(fn)`   | returns value   | calls fn         |
| `expect(msg)`        | returns value   | throws with msg  |
| `map(fn)`            | `Ok(fn(value))` | `Err(error)`     |
| `mapErr(fn)`         | `Ok(value)`     | `Err(fn(error))` |
| `andThen(fn)`        | `fn(value)`     | `Err(error)`     |
| `ok()`               | `Some(value)`   | `None`           |
| `err()`              | `None`          | `Some(error)`    |
| `match(onOk, onErr)` | `onOk(value)`   | `onErr(error)`   |

**Factories**

```ts
ok(42); // Ok<number>
err("something"); // Err<string>
```

### Utility Functions

#### `tryCatch`

```ts
const result = tryCatch(() => {
	// may throw
	return JSON.parse(input);
});
```

#### `asyncTryCatch`

```ts
const result = await asyncTryCatch(async () => {
	const res = await fetch(url);
	if (!res.ok) throw new Error("HTTP " + res.status);
	return res.json();
});
```

## Running Tests

```bash
deno test src/test.ts
```

## License

MIT
