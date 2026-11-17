"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; badge?: number };

export function NavLinks({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const active = items.map((i) => i.href).filter((h) => path === h || (h !== "/admin" && path.startsWith(h + "/"))).sort((a, b) => b.length - a.length)[0];
  return (
    <ul className="space-y-0.5">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} aria-current={i.href === active ? "page" : undefined} className="flex min-h-10 items-center justify-between rounded-md px-3 text-[15px] text-white/85 hover:bg-white/10 hover:text-white aria-[current=page]:bg-white aria-[current=page]:font-semibold aria-[current=page]:text-brown-dark">
            {i.label}
            {!!i.badge && <span className="rounded bg-[#d9a441] px-1.5 text-xs font-semibold text-ink num">{i.badge}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
