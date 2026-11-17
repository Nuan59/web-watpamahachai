import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "./db";
import { day } from "./dates";
import { normalisePhone, seatsLeft, signUp } from "./events";

let n = 0;
async function makeEvent(over: Partial<{ signupOpen: boolean; capacity: number | null; published: boolean; start: string; end: string }> = {}) {
  n++;
  return prisma.event.create({
    data: {
      slug: `ev-${n}-${Date.now()}`, title: "ปฏิบัติธรรม", kind: "RETREAT",
      startDate: day(over.start ?? "2026-12-10"), endDate: day(over.end ?? "2026-12-12"),
      signupOpen: over.signupOpen ?? true, capacity: over.capacity === undefined ? 3 : over.capacity, published: over.published ?? true,
    },
  });
}
const NOW = new Date("2026-12-01T03:00:00Z");

beforeEach(async () => {
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
});

describe("normalisePhone", () => {
  it("accepts Thai mobiles and landlines in common formats", () => {
    expect(normalisePhone("085-379-5589")).toBe("0853795589");
    expect(normalisePhone("+66 85 379 5589")).toBe("0853795589");
    expect(normalisePhone("034 123 456")).toBe("034123456");
    expect(normalisePhone("12345")).toBeNull();
  });
});

describe("signUp", () => {
  it("records a sign-up with a normalised phone", async () => {
    const ev = await makeEvent();
    const r = await signUp({ eventId: ev.id, name: " สมใจ ", phone: "085-379-5589", people: 2, gender: "FEMALE" }, NOW);
    expect(r.ok).toBe(true);
    const row = await prisma.registration.findFirstOrThrow({ where: { eventId: ev.id } });
    expect(row).toMatchObject({ name: "สมใจ", phone: "0853795589", people: 2, gender: "FEMALE", status: "NEW" });
  });
  it("refuses when sign-up is closed, unpublished or the event is over", async () => {
    expect(await signUp({ eventId: (await makeEvent({ signupOpen: false })).id, name: "ก", phone: "0812345678" }, NOW)).toEqual({ ok: false, error: "CLOSED" });
    expect(await signUp({ eventId: (await makeEvent({ published: false })).id, name: "ก", phone: "0812345678" }, NOW)).toEqual({ ok: false, error: "NOT_FOUND" });
    expect(await signUp({ eventId: (await makeEvent({ start: "2026-11-01", end: "2026-11-02" })).id, name: "ก", phone: "0812345678" }, NOW)).toEqual({ ok: false, error: "PAST" });
  });
  it("validates name, phone and number of people", async () => {
    const ev = await makeEvent();
    expect(await signUp({ eventId: ev.id, name: "", phone: "0812345678" }, NOW)).toEqual({ ok: false, error: "REQUIRED" });
    expect(await signUp({ eventId: ev.id, name: "ก", phone: "123" }, NOW)).toEqual({ ok: false, error: "BAD_PHONE" });
    expect(await signUp({ eventId: ev.id, name: "ก", phone: "0812345678", people: 0 }, NOW)).toEqual({ ok: false, error: "BAD_PEOPLE" });
  });
  it("counts people against capacity and ignores cancelled sign-ups", async () => {
    const ev = await makeEvent({ capacity: 3 });
    expect((await signUp({ eventId: ev.id, name: "ก", phone: "0812345678", people: 2 }, NOW)).ok).toBe(true);
    expect(await signUp({ eventId: ev.id, name: "ข", phone: "0812345679", people: 2 }, NOW)).toEqual({ ok: false, error: "FULL" });
    expect(await seatsLeft(ev.id, 3)).toBe(1);
    await prisma.registration.updateMany({ where: { eventId: ev.id }, data: { status: "CANCELLED" } });
    expect((await signUp({ eventId: ev.id, name: "ข", phone: "0812345679", people: 3 }, NOW)).ok).toBe(true);
    expect(await seatsLeft(ev.id, 3)).toBe(0);
  });
  it("no capacity means no limit", async () => {
    const ev = await makeEvent({ capacity: null });
    expect((await signUp({ eventId: ev.id, name: "ก", phone: "0812345678", people: 20 }, NOW)).ok).toBe(true);
    expect(await seatsLeft(ev.id, null)).toBeNull();
  });
  it("never oversells when many people sign up at once", async () => {
    const ev = await makeEvent({ capacity: 3 });
    const rs = await Promise.all(Array.from({ length: 8 }, (_, i) => signUp({ eventId: ev.id, name: `ค${i}`, phone: `08123456${String(i).padStart(2, "0")}` }, NOW)));
    expect(rs.filter((r) => r.ok)).toHaveLength(3);
    expect(rs.filter((r) => !r.ok && r.error === "FULL")).toHaveLength(5);
    expect(await prisma.registration.count({ where: { eventId: ev.id } })).toBe(3);
  });
});
