import { prisma } from "./db";
import { today } from "./dates";

export type SignupInput = { eventId: string; name: string; phone: string; age?: number; gender?: string; people?: number; note?: string };
export type SignupResult = { ok: true; id: string } | { ok: false; error: "REQUIRED" | "BAD_PHONE" | "CLOSED" | "FULL" | "NOT_FOUND" | "PAST" | "BAD_PEOPLE" };

/** Thai phone, digits only after removing spaces/dashes: 9–10 digits starting with 0, or +66. */
export function normalisePhone(raw: string): string | null {
  const d = raw.replace(/[\s-]/g, "").replace(/^\+66/, "0");
  return /^0\d{8,9}$/.test(d) ? d : null;
}

/** Seats still free (null = no limit). Cancelled sign-ups don't count. */
export async function seatsLeft(eventId: string, capacity: number | null) {
  if (capacity == null) return null;
  const agg = await prisma.registration.aggregate({ where: { eventId, status: { not: "CANCELLED" } }, _sum: { people: true } });
  return Math.max(0, capacity - (agg._sum.people ?? 0));
}

// SQLite lets one writer in at a time; queue sign-ups inside this (single) server process so a burst
// of requests gets "full" answers instead of database timeouts. The transaction below is still what
// guarantees the seat count (and would on Postgres, where the row update locks the event).
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

/** Public sign-up. Capacity is checked inside the same transaction that writes the row. */
export function signUp(input: SignupInput, now = new Date()): Promise<SignupResult> {
  return serial(() => signUpNow(input, now));
}

async function signUpNow(input: SignupInput, now: Date): Promise<SignupResult> {
  const name = input.name.trim();
  if (!name || !input.phone.trim()) return { ok: false, error: "REQUIRED" };
  const phone = normalisePhone(input.phone);
  if (!phone) return { ok: false, error: "BAD_PHONE" };
  const people = input.people ?? 1;
  if (!Number.isInteger(people) || people < 1 || people > 20) return { ok: false, error: "BAD_PEOPLE" };
  return prisma.$transaction(async (tx) => {
    // Writing first takes the row lock (SQLite: the database write lock) before seats are counted.
    const ev = await tx.event.update({ where: { id: input.eventId }, data: { lockVersion: { increment: 1 } } }).catch(() => null);
    if (!ev || !ev.published) return { ok: false, error: "NOT_FOUND" } as const;
    if (!ev.signupOpen) return { ok: false, error: "CLOSED" } as const;
    if (ev.endDate < today(now)) return { ok: false, error: "PAST" } as const;
    if (ev.capacity != null) {
      const agg = await tx.registration.aggregate({ where: { eventId: ev.id, status: { not: "CANCELLED" } }, _sum: { people: true } });
      if ((agg._sum.people ?? 0) + people > ev.capacity) return { ok: false, error: "FULL" } as const;
    }
    const r = await tx.registration.create({
      data: {
        eventId: ev.id, name: name.slice(0, 120), phone, people,
        age: input.age && input.age > 0 && input.age < 120 ? input.age : null,
        gender: input.gender === "MALE" || input.gender === "FEMALE" ? input.gender : "",
        note: (input.note ?? "").trim().slice(0, 1000),
      },
    });
    return { ok: true, id: r.id } as const;
  }, { maxWait: 15000, timeout: 15000 });
}

export const upcomingEvents = (limit = 6, now = new Date()) =>
  prisma.event.findMany({ where: { published: true, endDate: { gte: today(now) } }, orderBy: { startDate: "asc" }, take: limit });
