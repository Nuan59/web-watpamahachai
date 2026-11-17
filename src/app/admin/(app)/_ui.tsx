import Link from "next/link";
import { redirect } from "next/navigation";

/** Server actions end with this: back to a page with a message shown by <Flash>. */
export function done(path: string, msg: { ok?: string; error?: string }): never {
  const q = new URLSearchParams(msg as Record<string, string>).toString();
  redirect(`${path}${path.includes("?") ? "&" : "?"}${q}`);
}

export function Flash({ sp }: { sp: { ok?: string; error?: string } }) {
  if (sp.error) return <p role="alert" className="mb-4 rounded-md border border-bad/40 bg-white px-3 py-2 text-sm text-bad">{sp.error}</p>;
  if (sp.ok) return <p role="status" className="mb-4 rounded-md border border-ok/30 bg-ok-tint px-3 py-2 text-sm text-ok">{sp.ok}</p>;
  return null;
}

export type SP = Promise<{ ok?: string; error?: string; [k: string]: string | undefined }>;

export function Head({ title, crumbs, actions }: { title: string; crumbs?: [string, string?][]; actions?: React.ReactNode }) {
  return (
    <div className="mb-5">
      {crumbs && (
        <p className="text-sm text-muted">
          {crumbs.map(([l, h], i) => <span key={i}>{i > 0 && " / "}{h ? <Link href={h} className="underline underline-offset-2">{l}</Link> : l}</span>)}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{title}</h1>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, actions, children, className = "" }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-lg border border-line bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          {title && <h2 className="text-lg">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Field({ label, children, hint, className = "" }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="hint mt-1 block">{hint}</span>}
    </label>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2">
      <input type="checkbox" name={name} value="1" defaultChecked={defaultChecked} className="h-5 w-5 accent-[#744a24]" />
      <span>{label}</span>
    </label>
  );
}

export function Pill({ tone = "grey", children }: { tone?: "ok" | "warn" | "grey" | "brown" | "bad"; children: React.ReactNode }) {
  const c = { ok: "bg-ok-tint text-ok border-ok/30", warn: "bg-warn-tint text-warn border-warn/30", grey: "bg-cream text-muted border-line", brown: "bg-brown text-white border-brown", bad: "bg-white text-bad border-bad/40" }[tone];
  return <span className={`inline-flex items-center whitespace-nowrap rounded border px-1.5 py-0.5 text-xs font-medium ${c}`}>{children}</span>;
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="-mx-4 overflow-x-auto px-4">{children}</div>;
}

export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export const int = (f: FormData, k: string) => {
  const n = parseInt(str(f, k), 10);
  return Number.isFinite(n) ? n : 0;
};
export const optInt = (f: FormData, k: string) => (str(f, k) === "" ? null : int(f, k));
export const bool = (f: FormData, k: string) => f.get(k) === "1";
export const file = (f: FormData, k: string) => {
  const v = f.get(k);
  return v instanceof File && v.size > 0 ? v : null;
};
