import Link from "next/link";
import { dayBadge, thRange } from "@/lib/dates";
import { EVENT_KIND, label } from "@/lib/labels";

export function PageHead({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="hero-bg border-b border-line">
      <div className="wrap py-12 text-center sm:py-16">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl sm:text-4xl">{title}</h1>
        {children && <div className="mx-auto mt-3 max-w-2xl text-muted">{children}</div>}
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, children, align = "center" }: { eyebrow?: string; title: string; children?: React.ReactNode; align?: "center" | "left" }) {
  return (
    <div className={`mb-8 ${align === "center" ? "mx-auto max-w-2xl text-center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-1 text-2xl sm:text-3xl">{title}</h2>
      {children && <p className="mt-2 text-muted">{children}</p>}
    </div>
  );
}

export function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 mt-14 flex items-center gap-4">
      <h2 className="text-2xl">{children}</h2>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function InfoCard({ icon, title, children }: { icon?: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h3 className="mb-2 flex items-center gap-2 text-lg">{icon && <span aria-hidden>{icon}</span>}{title}</h3>
      <div className="text-[15px] text-muted [&_li]:mb-1.5 [&_li::marker]:text-brown [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </div>
  );
}

export type EventCardData = { slug: string; title: string; kind: string; startDate: Date; endDate: Date; timeText: string; summary: string; signupOpen: boolean };

export function EventCard({ e }: { e: EventCardData }) {
  const b = dayBadge(e.startDate);
  return (
    <Link href={`/events/${e.slug}`} className="card group flex gap-4 p-4 transition-colors hover:border-brown">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-brown text-white">
        <span className="font-display text-2xl leading-none">{b.day}</span>
        <span className="text-xs">{b.month}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-grey">{label(EVENT_KIND, e.kind)} · {thRange(e.startDate, e.endDate)}{e.timeText && ` · ${e.timeText}`}</p>
        <h3 className="text-lg group-hover:text-brown">{e.title}</h3>
        {e.summary && <p className="line-clamp-2 text-sm text-muted">{e.summary}</p>}
        {e.signupOpen && <p className="mt-1 text-sm font-semibold text-brown">เปิดลงทะเบียน →</p>}
      </div>
    </Link>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-line bg-white/60 px-4 py-8 text-center text-muted">{children}</p>;
}

export function Notice({ tone = "ok", children }: { tone?: "ok" | "bad" | "info"; children: React.ReactNode }) {
  const c = { ok: "border-ok/30 bg-ok-tint text-ok", bad: "border-bad/40 bg-white text-bad", info: "border-brown/30 bg-brown-tint text-brown-dark" }[tone];
  return <p role={tone === "bad" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm ${c}`}>{children}</p>;
}
