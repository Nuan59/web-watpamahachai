import { expect, it } from "vitest";
import { allow } from "./ratelimit";

it("allows up to max per window, then refuses until the window passes", () => {
  const k = `t-${Math.random()}`;
  expect([1, 2, 3].map(() => allow(k, 3, 1000, 0))).toEqual([true, true, true]);
  expect(allow(k, 3, 1000, 500)).toBe(false);
  expect(allow(k, 3, 1000, 1500)).toBe(true);
});

it("blocked/recordFailure only count failures", async () => {
  const { blocked, recordFailure } = await import("./ratelimit");
  const k = `f-${Math.random()}`;
  expect(blocked(k, 2, 1000, 0)).toBe(false);
  recordFailure(k, 0); recordFailure(k, 10);
  expect(blocked(k, 2, 1000, 20)).toBe(true);
  expect(blocked(k, 2, 1000, 1100)).toBe(false);
});
