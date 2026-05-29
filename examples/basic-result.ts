// examples/basic-result.ts
import { attempt, err, ok } from "../mod.ts";

console.log("=== Basic Result with factories ===\n");

// Using factories (recommended for ergonomics)
const success = ok(42);
const failure = err("something went wrong");

console.log("success.isOk():", success.isOk()); // true
console.log("failure.isErr():", failure.isErr()); // true

console.log("\n--- map / mapErr ---");
const doubled = success.map((n) => n * 2);
console.log("doubled.unwrap():", doubled.unwrap()); // 84

const wrappedErr = failure.mapErr((e) => `Error: ${e}`);
console.log("wrappedErr.unwrapErr():", wrappedErr.unwrapErr()); // "Error: something went wrong"

console.log("\n--- andThen (flatMap) ---");
const chained = success.andThen((n) => ok(`The answer is ${n}`));
console.log("chained.unwrap():", chained.unwrap());

console.log("\n--- attempt helper (preferred) ---");
const risky = attempt(() => {
	if (Math.random() > 0.3) {
		return { user: "alice", id: 7 };
	}
	throw new Error("Database timeout");
});

if (risky.isOk()) {
	console.log("Got user:", risky.unwrap());
} else {
	console.error("Failed:", risky.unwrapErr());
}

console.log("\n--- (old tryCatch alias still works) ---");
console.log("Backward compat note: tryCatch is now an alias for attempt.");
