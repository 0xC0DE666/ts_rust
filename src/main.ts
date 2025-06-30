import { asyncTryCatch, tryCatch } from "./lib.ts";

const res = tryCatch<number, string>(() => {
  throw "Boom!!!";
  return 1 + 1;
});

if (res.is_ok()) {
  console.log(res.unwrap());
} else {
  console.error("Error: " + res.unwrap_err());
}

const asyncRes = await asyncTryCatch(async () => {
  return await new Promise((res, rej) => {
    setTimeout(() => res(100), 1000);
  });
});

if (asyncRes.is_ok()) {
  console.log(asyncRes.unwrap());
} else {
  console.log(asyncRes.unwrap_err());
}
