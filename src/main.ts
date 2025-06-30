import { asyncTryCatch, tryCatch } from "./lib.ts";

const res = tryCatch<number, string>(() => {
  throw "Boom!!!";
  return 1 + 1;
});

if (res.isOk()) {
  console.log(res.unwrap());
} else {
  console.error("Error: " + res.unwrapErr());
}

const asyncRes = await asyncTryCatch(async () => {
  return await new Promise((res, rej) => {
    setTimeout(() => res(100), 1000);
  });
});

if (asyncRes.isOk()) {
  console.log(asyncRes.unwrap());
} else {
  console.log(asyncRes.unwrapErr());
}
