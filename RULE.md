# RULE: ts-rust (Rust-like Result & Option in TypeScript/Deno)

**Library**: `@0xc0de666/ts-rust` (also referred to as `ts-rust`)  
**Version target**: ≥ 1.1.0  
**Core Mandate**: **Completely eliminate `null`, `undefined`, `T | null`, `T | undefined`, optional chaining on domain values, and throwing for expected errors.** Use explicit `Option<T>` and `Result<T, E>` instead.

## 1. Core Philosophy

- **Explicit > Implicit**. The type system must tell you when a value might be absent or an operation might fail.
- **No surprises at runtime**. If something can fail or be missing, the type must reflect it.
- **Rust-inspired ergonomics in TypeScript/Deno**. We want the safety and clarity of Rust without the ceremony.
- **Fail fast at the right boundary**. Use `.expect()` or `.unwrap()` only at the absolute edges of the system (CLI entrypoints, top-level handlers, tests). Never in library or business logic.
- **Prefer composition over control flow**. Chain with `map` / `andThen` / `orElse`. Use `match` for exhaustive handling.

**Golden Rule**: If you ever write `null`, `undefined`, `?.`, `||`, `??`, `T | null`, or `throw` for a *recoverable* condition in new code, you are doing it wrong.

## 2. Primary Types & Factories (Always Use These)

### Option<T> – “This value may or may not be present”

```ts
import { some, none, Option } from "@0xc0de666/ts-rust";

const user: Option<User> = some(foundUser);
const missing: Option<User> = none();
```

**Never do this**:
- `User | null`
- `User | undefined`
- `user?.name`
- `if (!user) ...`

### Result<T, E> – “This operation can succeed or fail”

```ts
import { ok, err, Result } from "@0xc0de666/ts-rust";

const success: Result<User, string> = ok(user);
const failure: Result<User, string> = err("User not found");
```

**Never do this**:
- Return `null` / `undefined` on error
- Throw exceptions for expected failures
- Use error codes or sentinel values

## 3. Preferred Helper Functions

**Use the modern names** (primary since 1.1.0):

```ts
import { attempt, attemptAsync } from "@0xc0de666/ts-rust";

// Sync
const result = attempt(() => JSON.parse(input));

// Async
const result = await attemptAsync(async () => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
});
```

**Legacy aliases** (`tryCatch` / `asyncTryCatch`) still work for migration but are **deprecated**. **Never introduce new usage** of the old names in fresh code.

## 4. Key Methods & Idioms (Memorize These)

### Option Methods

| Method              | Purpose                              | Preferred Over          |
|---------------------|--------------------------------------|-------------------------|
| `.map(fn)`          | Transform value if present           | `if (x) { transform }`  |
| `.andThen(fn)`      | Chain another `Option`               | Nested ifs              |
| `.or(other)`        | Fallback Option                      | `??` / `||`             |
| `.orElse(fn)`       | Lazy fallback                        | `??`                    |
| `.unwrapOr(default)`| Safe default                         | `??`                    |
| `.unwrapOrElse(fn)` | Lazy default                         | `??`                    |
| `.expect(msg)`      | Crash with message (boundaries only) | `!` non-null assertion  |
| `.match(onSome, onNone)` | Exhaustive handling             | if/else                 |
| `.flatten()`        | Collapse `Option<Option<T>>`         | —                       |

### Result Methods

| Method                  | Purpose                              | Preferred Over          |
|-------------------------|--------------------------------------|-------------------------|
| `.map(fn)`              | Transform success value              | Manual if               |
| `.mapErr(fn)`           | Transform error                      | —                       |
| `.andThen(fn)`          | Chain another fallible operation     | Nested try/catch        |
| `.unwrapOrElse(fn)`     | Fallback on error                    | —                       |
| `.expect(msg)`          | Crash with message (boundaries only) | `!` or `throw`          |
| `.match(onOk, onErr)`   | Exhaustive handling                  | if (result.isOk())      |
| `.ok()` / `.err()`      | Convert to Option                    | —                       |

## 5. Function Signature Rules

**Good**:
```ts
function findUser(id: string): Option<User>
function createUser(input: CreateUserInput): Result<User, ValidationError>
function fetchUser(id: string): Promise<Result<User, NetworkError>>
```

**Bad** (forbidden in new code):
```ts
function findUser(id: string): User | null
function createUser(input: CreateUserInput): User | null
function fetchUser(id: string): Promise<User> // throws on error
```

## 6. Control Flow Patterns (Preferred Order)

1. **Best**: Fluent chains + `.match()` at the end
2. **Good**: `.andThen()` / `.map()` chains
3. **Acceptable**: `if (result.isOk())` (only when you genuinely need early returns or complex logic)
4. **Forbidden**: `if (user == null)`, `user?.`, `||`, `??` on domain values

### Example – Good Pattern

```ts
const result = attempt(() => parseConfig())
  .andThen(validateConfig)
  .andThen(loadSecrets)
  .mapErr(e => `Failed to bootstrap: ${e}`);

result.match(
  (config) => startServer(config),
  (error) => {
    console.error(error);
    Deno.exit(1);
  }
);
```

## 7. Strict Rules for AI Agents (Non-Negotiable)

1. **Never** introduce `null`, `undefined`, `T | null`, or `T | undefined` in new code or refactors.
2. **Never** use optional chaining (`?.`) or nullish coalescing (`??` / `||`) on values that should be `Option` or `Result`.
3. **Never** use `!` non-null assertion operator.
4. **Prefer** `attempt()` / `attemptAsync()` over raw `try`/`catch`.
5. **Use** `ok()` / `err()` / `some()` / `none()` factories (not the `new` constructors).
6. **Use** `.match()` for final handling in most cases — it is more readable and exhaustive.
7. **Reserve** `.unwrap()` and `.expect()` for the outermost layer only.
8. **When porting** old code that returns `null`/`undefined` or throws:
   - Turn "not found" into `none()`
   - Turn "operation failed" into `err(...)`
   - Wrap throwing functions with `attempt` / `attemptAsync`

## 8. Common Refactoring Recipes

**Old**:
```ts
const user = db.findById(id);
if (!user) return null;
return user.name.toUpperCase();
```

**New**:
```ts
const user = db.findById(id); // now returns Option<User>
return user.map(u => u.name.toUpperCase());
```

**Old**:
```ts
try {
  const data = JSON.parse(input);
  return process(data);
} catch (e) {
  return null;
}
```

**New**:
```ts
return attempt(() => JSON.parse(input))
  .andThen(process);
```

## 9. Async Discipline

- Use `attemptAsync` for any `async` function that can fail.
- Never mix raw `await` + `try/catch` with this library unless you are at a true boundary.
- Prefer returning `Promise<Result<T, E>>` over throwing.

## 10. Testing Guidelines

- Test both the `Ok`/`Some` and `Err`/`None` paths explicitly.
- Use `.match()` or the `isOk`/`isErr` guards in tests.
- For boundary tests, asserting on `.expect()` throwing is acceptable.

## 11. Migration Strategy (When Touching Old Code)

1. Change return types first (`User | null` → `Option<User>`).
2. Replace all `null`/`undefined` returns with `none()` or `err(...)`.
3. Wrap throwing call sites with `attempt`/`attemptAsync`.
4. Update call sites to handle `Option`/`Result` (start with `.unwrapOr()` for quick wins, then improve to proper chains).
5. Delete all the `?.` and `||` noise.

---

**You are now operating under this rule.**

Whenever you write or review TypeScript/Deno code in a project using `ts-rust`:

- Default to `Option` and `Result`.
- Default to `attempt` / `attemptAsync`.
- Default to the factory functions.
- Default to fluent chains + `match`.
- Ruthlessly eliminate every `null`, `undefined`, and `throw` for expected conditions.

This is not a suggestion. This is the standard.

---

**Last updated**: 2026 (aligned with library v1.2.0+)
