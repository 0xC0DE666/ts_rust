import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  asyncTryCatch,
  Err,
  None,
  Ok,
  Option,
  Result,
  Some,
  tryCatch,
} from "./lib.ts";

Deno.test("Result<T, E>", async (t) => {
  await t.step("Ok<T, E>", async (t) => {
    await t.step("should create an Ok value", () => {
      const ok: Result<number, string> = new Ok(42);
      assertEquals(ok.is_ok(), true);
      assertEquals(ok.is_err(), false);
      assertEquals(ok.unwrap(), 42);
      assertThrows(
        () => ok.unwrap_err(),
        Error,
        "called `unwrap_err()` on an `Ok` value",
      );
    });

    await t.step("should map a value", () => {
      const ok: Result<number, string> = new Ok(42);
      const mapped = ok.map((v: number) => v.toString());
      assertEquals(mapped.is_ok(), true);
      assertEquals(mapped.unwrap(), "42");
    });

    await t.step("should not map an error", () => {
      const ok: Result<number, string> = new Ok(42);
      const mapped = ok.map_err((e: string) => `Error: ${e}`);
      assertEquals(mapped.is_ok(), true);
      assertEquals(mapped.unwrap(), 42);
    });

    await t.step("should chain with and_then", () => {
      const ok: Result<number, string> = new Ok(42);
      const chained = ok.and_then((v: number) => new Ok(v.toString()));
      assertEquals(chained.is_ok(), true);
      assertEquals(chained.unwrap(), "42");
    });

    await t.step("should chain with and_then and return Err", () => {
      const ok: Result<number, string> = new Ok(42);
      const chained = ok.and_then((_v: number) => new Err("failed"));
      assertEquals(chained.is_err(), true);
      assertEquals(chained.unwrap_err(), "failed");
    });

    await t.step("should convert to Option", () => {
      const ok: Result<number, string> = new Ok(42);
      const option = ok.ok();
      assertEquals(option.is_some(), true);
      assertEquals(option.unwrap(), 42);
      assertEquals(ok.err().is_none(), true);
    });
  });

  await t.step("Err<T, E>", async (t) => {
    await t.step("should create an Err value", () => {
      const err: Result<number, string> = new Err("Error");
      assertEquals(err.is_ok(), false);
      assertEquals(err.is_err(), true);
      assertEquals(err.unwrap_err(), "Error");
      assertThrows(
        () => err.unwrap(),
        Error,
        "called `unwrap()` on an `Err` value: Error",
      );
    });

    await t.step("should not map a value", () => {
      const err: Result<number, string> = new Err("Error");
      const mapped = err.map((v: number) => v.toString());
      assertEquals(mapped.is_err(), true);
      assertEquals(mapped.unwrap_err(), "Error");
    });

    await t.step("should map an error", () => {
      const err: Result<number, string> = new Err("Error");
      const mapped = err.map_err((e: string) => `New Error: ${e}`);
      assertEquals(mapped.is_err(), true);
      assertEquals(mapped.unwrap_err(), "New Error: Error");
    });

    await t.step("should not chain with and_then", () => {
      const err: Result<number, string> = new Err("Error");
      const chained = err.and_then((v: number) => new Ok(v.toString()));
      assertEquals(chained.is_err(), true);
      assertEquals(chained.unwrap_err(), "Error");
    });

    await t.step("should convert to Option", () => {
      const err: Result<number, string> = new Err("Error");
      const option = err.err();
      assertEquals(option.is_some(), true);
      assertEquals(option.unwrap(), "Error");
      assertEquals(err.ok().is_none(), true);
    });
  });
});

Deno.test("tryCatch", () => {
  const result = tryCatch(() => 42);
  assertEquals(result.is_ok(), true);
  assertEquals(result.unwrap(), 42);

  const error = new Error("Catch me");
  const errResult = tryCatch(() => {
    throw error;
  });
  assertEquals(errResult.is_err(), true);
  assertEquals(errResult.unwrap_err(), error);
});

Deno.test("asyncTryCatch", async () => {
  const result = await asyncTryCatch(async () => {
    return await Promise.resolve(42);
  });
  assertEquals(result.is_ok(), true);
  assertEquals(result.unwrap(), 42);

  const error = new Error("Catch me");
  const errResult = await asyncTryCatch(async () => {
    return await Promise.reject(error);
  });
  assertEquals(errResult.is_err(), true);
  assertEquals(errResult.unwrap_err(), error);
});

Deno.test("Option<T>", async (t) => {
  await t.step("Some<T>", async (t) => {
    await t.step("should create a Some value", () => {
      const some = new Some(42);
      assertEquals(some.is_some(), true);
      assertEquals(some.is_none(), false);
      assertEquals(some.unwrap(), 42);
    });

    await t.step("should map a value", () => {
      const some = new Some(42);
      const mapped = some.map((v: number) => v.toString());
      assertEquals(mapped.is_some(), true);
      assertEquals(mapped.unwrap(), "42");
    });

    await t.step("should chain with and_then", () => {
      const some = new Some(42);
      const chained = some.and_then((v: number) => new Some(v.toString()));
      assertEquals(chained.is_some(), true);
      assertEquals(chained.unwrap(), "42");
    });

    await t.step("should chain with and_then and return None", () => {
      const some = new Some(42);
      const chained = some.and_then((_v: number) => new None());
      assertEquals(chained.is_none(), true);
    });

    await t.step("should unwrap_or", () => {
      const some = new Some(42);
      assertEquals(some.unwrap_or(0), 42);
    });
  });

  await t.step("None<T>", async (t) => {
    await t.step("should create a None value", () => {
      const none = new None();
      assertEquals(none.is_some(), false);
      assertEquals(none.is_none(), true);
      assertThrows(
        () => none.unwrap(),
        Error,
        "called `unwrap()` on a `None` value",
      );
    });

    await t.step("should not map a value", () => {
      const none: Option<number> = new None();
      const mapped = none.map((v: number) => v.toString());
      assertEquals(mapped.is_none(), true);
    });

    await t.step("should not chain with and_then", () => {
      const none: Option<number> = new None();
      const chained = none.and_then((v: number) => new Some(v.toString()));
      assertEquals(chained.is_none(), true);
    });

    await t.step("should unwrap_or with default value", () => {
      const none: Option<number> = new None();
      assertEquals(none.unwrap_or(0), 0);
    });
  });
});
