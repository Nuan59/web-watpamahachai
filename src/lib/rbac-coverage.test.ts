import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Every back-office page, server action and route must check a section permission on the server.
// Only these may rely on being signed in (or on nothing): login, the denied page, own password.
const ROOT = path.resolve(__dirname, "../app/admin");
const EXEMPT = ["login/page.tsx", "(app)/denied/page.tsx", "(app)/account/page.tsx", "(app)/layout.tsx", "layout.tsx"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("RBAC coverage", () => {
  const files = walk(ROOT).filter((f) => /(page\.tsx|actions\.ts|route\.ts)$/.test(f)).map((f) => path.relative(ROOT, f));
  it("finds the admin files", () => expect(files.length).toBeGreaterThan(20));
  for (const f of files.filter((f) => !EXEMPT.includes(f))) {
    it(`${f} checks requirePerm`, () => {
      const src = readFileSync(path.join(ROOT, f), "utf8");
      if (f.endsWith("actions.ts")) {
        // each exported action calls requirePerm before anything else
        const fns = src.split(/export async function /).slice(1);
        expect(fns.length).toBeGreaterThan(0);
        for (const fn of fns) expect(fn.slice(0, 400), fn.slice(0, 40)).toMatch(/await requirePerm\(/);
      } else {
        expect(src).toMatch(/await requirePerm\(/);
      }
    });
  }
  it("the account page checks the session", () => {
    expect(readFileSync(path.join(ROOT, "(app)/account/page.tsx"), "utf8")).toMatch(/getUser\(\)/);
  });
});
