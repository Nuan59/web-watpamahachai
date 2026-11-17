"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type NavItem = { href: string; label: string; children?: { href: string; label: string }[] };

/** Internal links go through next/link; outside links open in a new tab. */
function L({ href, className, children, ...rest }: { href: string; className?: string; children: React.ReactNode; "aria-current"?: "page" | undefined }) {
  return /^https?:/.test(href)
    ? <a href={href} target="_blank" rel="noopener" className={className}>{children}</a>
    : <Link href={href} className={className} {...rest}>{children}</Link>;
}

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export function DesktopNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {items.map((i) => (
        <li key={i.href} className="group relative">
          <Link
            href={i.href}
            aria-current={isActive(path, i.href) ? "page" : undefined}
            className="flex min-h-11 items-center rounded-md px-3 text-[15px] text-muted hover:text-brown-dark aria-[current=page]:font-semibold aria-[current=page]:text-brown"
          >
            {i.label}
            {i.children && <span aria-hidden className="ml-1 text-xs">▾</span>}
          </Link>
          {i.children && (
            <ul className="invisible absolute left-1/2 top-full z-40 max-h-[70vh] min-w-52 -translate-x-1/2 overflow-y-auto rounded-lg border border-line bg-white p-1.5 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {i.children.map((c) => (
                <li key={c.href + c.label}>
                  <L href={c.href} className="block whitespace-nowrap rounded-md px-3 py-2 text-sm text-ink hover:bg-cream hover:text-brown-dark">{c.label}</L>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Phone menu. The sheet is portalled to <body> so a blurred header can't clip it. */
export function MobileNav({ items, footer }: { items: NavItem[]; footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);
  return (
    <>
      <button type="button" className="btn btn-sm lg:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>เมนู</button>
      {mounted && open && createPortal(
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="เมนู" className="fixed inset-0 z-50 flex flex-col bg-paper">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-display text-lg font-semibold text-brown-dark">วัดป่ามหาไชย</span>
            <button type="button" className="btn btn-sm" onClick={() => setOpen(false)}>ปิด</button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-2">
            <ul>
              {items.map((i) => (
                <li key={i.href} className="border-b border-cream">
                  <Link href={i.href} aria-current={isActive(path, i.href) ? "page" : undefined} className="flex min-h-12 items-center text-lg aria-[current=page]:font-semibold aria-[current=page]:text-brown">{i.label}</Link>
                  {i.children && (
                    <ul className="mb-2 ml-3 border-l border-line pl-3">
                      {i.children.map((c) => (
                        <li key={c.href + c.label}><L href={c.href} className="flex min-h-11 items-center text-muted">{c.label}</L></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-line px-4 py-4 text-sm text-muted">{footer}</div>
        </div>,
        document.body,
      )}
    </>
  );
}
