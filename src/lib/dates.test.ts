import { describe, expect, it } from "vitest";
import { day, isoDay, thDate, thRange, today } from "./dates";

describe("dates (Bangkok)", () => {
  it("stores a day as 00:00 Bangkok and reads it back", () => {
    const d = day("2026-12-05");
    expect(d.toISOString()).toBe("2026-12-04T17:00:00.000Z");
    expect(isoDay(d)).toBe("2026-12-05");
  });
  it("rejects malformed dates", () => {
    expect(() => day("5/12/2026")).toThrow();
    expect(() => day("2026-13-40")).toThrow();
  });
  it("today follows Bangkok, not UTC", () => {
    expect(isoDay(today(new Date("2026-12-04T18:30:00Z")))).toBe("2026-12-05");
  });
  it("formats with the Buddhist year", () => {
    expect(thDate(day("2026-12-05"))).toContain("2569");
  });
  it("collapses ranges in the same month", () => {
    expect(thRange(day("2026-12-05"), day("2026-12-07"))).toMatch(/^5–7 ธ\.ค\. 2569$/);
    expect(thRange(day("2026-12-05"), day("2026-12-05"))).toBe(thDate(day("2026-12-05")));
    expect(thRange(day("2026-12-30"), day("2027-01-02"))).toContain("2570");
  });
});
