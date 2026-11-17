// All dates are temple-local (Asia/Bangkok, UTC+7, no DST). A "day" is stored as 00:00 Bangkok time.
const TZ = "Asia/Bangkok";

/** "2026-12-05" → Date at 00:00 Bangkok. Throws on a malformed value. */
export function day(iso: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error(`Bad date: ${iso}`);
  const d = new Date(`${iso}T00:00:00+07:00`);
  if (isNaN(+d)) throw new Error(`Bad date: ${iso}`);
  return d;
}

/** Date → "2026-12-05" in Bangkok time (for <input type=date>). */
export function isoDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export const today = (now = new Date()) => day(isoDay(now));

/** "5 ธ.ค. 2569" (Buddhist year). */
export function thDate(d: Date, opts: { long?: boolean; weekday?: boolean } = {}) {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    timeZone: TZ, day: "numeric", month: opts.long ? "long" : "short", year: "numeric", ...(opts.weekday ? { weekday: "long" } : {}),
  }).format(d);
}

/** One day or a range: "5 ธ.ค. 2569" / "5–7 ธ.ค. 2569" / "30 ธ.ค. 2569 – 2 ม.ค. 2570". */
export function thRange(start: Date, end: Date) {
  if (isoDay(start) === isoDay(end)) return thDate(start);
  const p = (d: Date) => Object.fromEntries(
    new Intl.DateTimeFormat("th-TH-u-ca-buddhist", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  const a = p(start), b = p(end);
  if (a.year === b.year && a.month === b.month) return `${a.day}–${b.day} ${b.month} ${b.year}`;
  if (a.year === b.year) return `${a.day} ${a.month} – ${b.day} ${b.month} ${b.year}`;
  return `${thDate(start)} – ${thDate(end)}`;
}

export function thDateTime(d: Date) {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", { timeZone: TZ, day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
}

/** Day and short month for a calendar badge. */
export function dayBadge(d: Date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("th-TH", { timeZone: TZ, day: "numeric", month: "short" }).formatToParts(d).map((x) => [x.type, x.value]));
  return { day: parts.day, month: parts.month };
}
