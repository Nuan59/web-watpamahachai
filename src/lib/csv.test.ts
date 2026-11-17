import { expect, it } from "vitest";
import { toCsv } from "./csv";

it("quotes, escapes, defuses formulas and starts with a BOM", () => {
  const out = toCsv([["ชื่อ", "a,b", 'he said "x"', "=1+1", 5]]);
  expect(out.startsWith("﻿")).toBe(true);
  expect(out).toBe('﻿ชื่อ,"a,b","he said ""x""",\'=1+1,5\r\n');
});
