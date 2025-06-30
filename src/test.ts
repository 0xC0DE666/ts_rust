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
      assertEquals(ok.isOk(), true);
      assertEquals(ok.isErr(), false);
      assertEquals(ok.unwrap(), 42);
      assertThrows(
        () => ok.unwrapErr(),
        Error,
        "called `unwrapErr()` on an `Ok` value",
      );
    });

    await t.step("should map a value", () => {
      const ok: Result<number, string> = new Ok(42);
      const mapped = ok.map((v: number) => v.toString());
      assertEquals(mapped.isOk(), true);
      assertEquals(mapped.unwrap(), "42");
    });

    await t.step("should not map an error", () => {
      const ok: Result<number, string> = new Ok(42);
      const mapped = ok.mapErr((e: string) => `Error: ${e}`);
      assertEquals(mapped.isOk(), true);
      assertEquals(mapped.unwrap(), 42);
    });

    await t.step("should chain with andThen", () => {
      const ok: Result<number, string> = new Ok(42);
      const chained = ok.andThen((v: number) => new Ok(v.toString()));
      assertEquals(chained.isOk(), true);
      assertEquals(chained.unwrap(), "42");
    });

    await t.step("should chain with andThen and return Err", () => {
      const ok: Result<number, string> = new Ok(42);
      const chained = ok.andThen((_v: number) => new Err("failed"));
      assertEquals(chained.isErr(), true);
      assertEquals(chained.unwrapErr(), "failed");
    });

    await t.step("should convert to Option", () => {
      const ok: Result<number, string> = new Ok(42);
      const option = ok.ok();
      assertEquals(option.isSome(), true);
      assertEquals(option.unwrap(), 42);
      assertEquals(ok.err().isNone(), true);
    });
  });

  await t.step("Err<T, E>", async (t) => {
    await t.step("should create an Err value", () => {
      const err: Result<number, string> = new Err("Error");
      assertEquals(err.isOk(), false);
      assertEquals(err.isErr(), true);
      assertEquals(err.unwrapErr(), "Error");
      assertThrows(
        () => err.unwrap(),
        Error,
        "called `unwrap()` on an `Err` value: Error",
      );
    });

    await t.step("should not map a value", () => {
      const err: Result<number, string> = new Err("Error");
      const mapped = err.map((v: number) => v.toString());
      assertEquals(mapped.isErr(), true);
      assertEquals(mapped.unwrapErr(), "Error");
    });

    await t.step("should map an error", () => {
      const err: Result<number, string> = new Err("Error");
      const mapped = err.mapErr((e: string) => `New Error: ${e}`);
      assertEquals(mapped.isErr(), true);
      assertEquals(mapped.unwrapErr(), "New Error: Error");
    });

    await t.step("should not chain with andThen", () => {
      const err: Result<number, string> = new Err("Error");
      const chained = err.andThen((v: number) => new Ok(v.toString()));
      assertEquals(chained.isErr(), true);
      assertEquals(chained.unwrapErr(), "Error");
    });

    await t.step("should convert to Option", () => {
      const err: Result<number, string> = new Err("Error");
      const option = err.err();
      assertEquals(option.isSome(), true);
      assertEquals(option.unwrap(), "Error");
      assertEquals(err.ok().isNone(), true);
    });
  });
});

Deno.test("tryCatch", () => {
  const result = tryCatch(() => 42);
  assertEquals(result.isOk(), true);
  assertEquals(result.unwrap(), 42);

  const error = new Error("Catch me");
  const errResult = tryCatch(() => {
    throw error;
  });
  assertEquals(errResult.isErr(), true);
  assertEquals(errResult.unwrapErr(), error);
});

Deno.test("asyncTryCatch", async () => {
  const result = await asyncTryCatch(async () => {
    return await Promise.resolve(42);
  });
  assertEquals(result.isOk(), true);
  assertEquals(result.unwrap(), 42);

  const error = new Error("Catch me");
  const errResult = await asyncTryCatch(async () => {
    return await Promise.reject(error);
  });
  assertEquals(errResult.isErr(), true);
  assertEquals(errResult.unwrapErr(), error);
});

Deno.test("Option<T>", async (t) => {
  await t.step("Some<T>", async (t) => {
    await t.step("should create a Some value", () => {
      const some = new Some(42);
      assertEquals(some.isSome(), true);
      assertEquals(some.isNone(), false);
      assertEquals(some.unwrap(), 42);
    });

    await t.step("should map a value", () => {
      const some = new Some(42);
      const mapped = some.map((v: number) => v.toString());
      assertEquals(mapped.isSome(), true);
      assertEquals(mapped.unwrap(), "42");
    });

    await t.step("should chain with andThen", () => {
      const some = new Some(42);
      const chained = some.andThen((v: number) => new Some(v.toString()));
      assertEquals(chained.isSome(), true);
      assertEquals(chained.unwrap(), "42");
    });

    await t.step("should chain with andThen and return None", () => {
      const some = new Some(42);
      const chained = some.andThen((_v: number) => new None());
      assertEquals(chained.isNone(), true);
    });

    await t.step("should unwrapOr", () => {
      const some = new Some(42);
      assertEquals(some.unwrapOr(0), 42);
    });
  });

  await t.step("None<T>", async (t) => {
    await t.step("should create a None value", () => {
      const none = new None();
      assertEquals(none.isSome(), false);
      assertEquals(none.isNone(), true);
      assertThrows(
        () => none.unwrap(),
        Error,
        "called `unwrap()` on a `None` value",
      );
    });

    await t.step("should not map a value", () => {
      const none: Option<number> = new None();
      const mapped = none.map((v: number) => v.toString());
      assertEquals(mapped.isNone(), true);
    });

    await t.step("should not chain with andThen", () => {
      const none: Option<number> = new None();
      const chained = none.andThen((v: number) => new Some(v.toString()));
      assertEquals(chained.isNone(), true);
    });

    await t.step("should unwrapOr with default value", () => {
      const none: Option<number> = new None();
      assertEquals(none.unwrapOr(0), 0);
    });
  });
});
