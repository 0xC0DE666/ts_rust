// examples/basic-option.ts
import { none, some } from "../mod.ts";

console.log("=== Basic Option with factories ===\n");

const present = some(42);
const absent = none<number>();

console.log("present.isSome():", present.isSome()); // true
console.log("absent.isNone():", absent.isNone()); // true

console.log("\n--- map ---");
const asString = present.map((n) => `value:${n}`);
console.log("asString.unwrap():", asString.unwrap()); // "value:42"

console.log("\n--- andThen (flatMap) ---");
const transformed = present.andThen((n) => some(n + 100));
console.log("transformed.unwrap():", transformed.unwrap()); // 142

console.log("\n--- unwrapOr / unwrapOrElse ---");
console.log("absent.unwrapOr(0):", absent.unwrapOr(0)); // 0
console.log("absent.unwrapOrElse(() => 99):", absent.unwrapOrElse(() => 99)); // 99

console.log("\n--- or / orElse ---");
const fallback = absent.or(some(7));
console.log("absent.or(some(7)).unwrap():", fallback.unwrap()); // 7

const lazyFallback = absent.orElse(() => some(123));
console.log("absent.orElse(...).unwrap():", lazyFallback.unwrap()); // 123

console.log("\n--- match ---");
const matched = present.match(
	(val) => `Got ${val}`,
	() => "Nothing here",
);
console.log("matched:", matched); // "Got 42"

const matchedNone = absent.match(
	(val) => `Got ${val}`,
	() => "Empty",
);
console.log("matchedNone:", matchedNone); // "Empty"

console.log("\n--- flatten (nested Option) ---");
const nested = some(some("deep"));
const flattened = nested.flatten();
console.log("flattened.unwrap():", flattened.unwrap()); // "deep"
