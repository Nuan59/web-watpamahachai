import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { endSession, getUser } from "@/lib/auth";
import { can, MODULE_HOME, MODULE_LABEL, type Module } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ROLE, label } from "@/lib/labels";
import { NavLinks, type NavItem } from "./nav-links";

async function logout() {
  "use server";
  await endSession();
  redirect("/admin/login");
}

const CONTENT: Module[] = ["home", "news", "events", "schedule", "dhamma", "gallery", "faq", "pages"];
const OFFICE: Module[] = ["registrations", "messages"];
const SYSTEM: Module[] = ["settings", "users"];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await getUser();
  if (!u) redirect("/admin/login");
  const [newRegs, unread] = await Promise.all([
    can(u, "registrations", "view") ? prisma.registration.count({ where: { status: "NEW" } }) : 0,
    can(u, "messages", "view") ? prisma.message.count({ where: { readAt: null } }) : 0,
  ]);
  const badges: Partial<Record<Module, number>> = { registrations: newRegs, messages: unread };
  const items = (ms: Module[]): NavItem[] => ms.filter((m) => can(u, m, "view")).map((m) => ({ href: MODULE_HOME[m], label: MODULE_LABEL[m], badge: badges[m] }));
  const groups: [string, NavItem[]][] = [
    ["", items(["dashboard"])],
    ["งานสำนักงาน", items(OFFICE)],
    ["เนื้อหาเว็บไซต์", items(CONTENT)],
    ["ระบบ", [...items(SYSTEM), ...(can(u, "users", "view") ? [{ href: "/admin/activity", label: "ประวัติการใช้งาน" }] : [])]],
  ];
  const nav = groups.filter(([, xs]) => xs.length).map(([title, xs]) => (
    <div key={title || "top"} className="mb-4">
      {title && <p className="mb-1 px-3 text-xs text-white/60">{title}</p>}
      <NavLinks items={xs} />
    </div>
  ));
  const who = (
    <div className="border-t border-white/15 p-3 text-sm">
      <p className="font-medium">{u.name}</p>
      <p className="text-white/70">{label(ROLE, u.role)}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Link href="/admin/account" className="text-white/85 underline underline-offset-2 hover:text-white">เปลี่ยนรหัสผ่าน</Link>
        <Link href="/" target="_blank" className="text-white/85 underline underline-offset-2 hover:text-white">ดูหน้าเว็บ ↗</Link>
        <form action={logout}><button className="cursor-pointer text-white/85 underline underline-offset-2 hover:text-white">ออกจากระบบ</button></form>
      </div>
    </div>
  );
  const brand = (
    <span className="flex items-center gap-2">
      <Image src="/logo.webp" alt="" width={32} height={32} className="rounded-full bg-white" />
      <span className="font-display text-lg font-semibold">วัดป่ามหาไชย <span className="font-sans text-sm font-normal text-white/70">หลังบ้าน</span></span>
    </span>
  );
  return (
    <>
      <a href="#main" className="skip-link">ข้ามไปที่เนื้อหา</a>
      <div className="min-h-dvh lg:grid lg:grid-cols-[230px_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col bg-brown-dark text-white lg:flex">
          <Link href="/admin" className="px-4 py-4">{brand}</Link>
          <nav className="flex-1 overflow-y-auto px-2 pb-4">{nav}</nav>
          {who}
        </aside>
        <details className="sticky top-0 z-30 bg-brown-dark text-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 [&::-webkit-details-marker]:hidden">
            {brand}<span className="rounded border border-white/40 px-2 py-0.5 text-sm">เมนู</span>
          </summary>
          <nav className="max-h-[70dvh] overflow-y-auto px-2 pb-2">{nav}</nav>
          {who}
        </details>
        <main id="main" tabIndex={-1} className="min-w-0 px-4 py-5 focus:outline-none lg:px-8 lg:py-7">{children}</main>
      </div>
    </>
  );
}
