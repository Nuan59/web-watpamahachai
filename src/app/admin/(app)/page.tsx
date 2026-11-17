import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { thDateTime, thRange, today } from "@/lib/dates";
import { getSettings, missing } from "@/lib/settings";
import { TOPIC, label } from "@/lib/labels";
import { Head, Panel, Pill } from "./_ui";

export const metadata = { title: "ภาพรวม" };

export default async function Dashboard() {
  const u = await requirePerm("dashboard");
  const t = today();
  const [events, regs, msgs, counts, s] = await Promise.all([
    prisma.event.findMany({ where: { endDate: { gte: t } }, orderBy: { startDate: "asc" }, take: 5, include: { _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } } } }),
    can(u, "registrations", "view") ? prisma.registration.findMany({ where: { status: "NEW" }, orderBy: { createdAt: "desc" }, take: 6, include: { event: { select: { title: true } } } }) : [],
    can(u, "messages", "view") ? prisma.message.findMany({ where: { readAt: null }, orderBy: { createdAt: "desc" }, take: 5 }) : [],
    Promise.all([prisma.post.count({ where: { status: "PUBLISHED" } }), prisma.post.count({ where: { status: "DRAFT" } }), prisma.audioTrack.count(), prisma.photo.count()]),
    getSettings(),
  ]);
  const todo = can(u, "settings", "view") ? missing(s) : [];
  const [pub, drafts, audio, photos] = counts;
  return (
    <div className="space-y-5">
      <Head title={`สวัสดี ${u.name}`} />
      {todo.length > 0 && (
        <p className="rounded-md border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn">
          ยังขาดข้อมูลวัด {todo.length} ช่อง (เช่น เลขบัญชีทำบุญ รูปเจ้าอาวาส) — <Link href="/admin/settings" className="font-semibold underline">กรอกที่ ข้อมูลวัด</Link>
        </p>
      )}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["ข่าวที่เผยแพร่", pub, "/admin/news"], ["ฉบับร่าง", drafts, "/admin/news"], ["เสียงธรรม", audio, "/admin/dhamma"], ["ภาพในคลัง", photos, "/admin/gallery"]].map(([l, n, h]) => (
          <Link key={l as string} href={h as string} className="rounded-lg border border-line bg-white p-4 hover:border-brown">
            <dt className="text-sm text-muted">{l}</dt><dd className="font-display text-3xl text-brown-dark num">{n}</dd>
          </Link>
        ))}
      </dl>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="กิจกรรมที่จะมาถึง" actions={can(u, "events", "create") && <Link href="/admin/events/new" className="btn btn-sm">+ เพิ่มกิจกรรม</Link>}>
          {events.length ? (
            <ul className="divide-y divide-cream">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><Link href={`/admin/events/${e.id}`} className="font-medium underline-offset-2 hover:underline">{e.title}</Link><span className="block text-sm text-muted">{thRange(e.startDate, e.endDate)}</span></span>
                  <span className="flex gap-1">{!e.published && <Pill>ซ่อนอยู่</Pill>}{e.signupOpen && <Pill tone="ok">ลงทะเบียน {e._count.registrations}{e.capacity != null ? `/${e.capacity}` : ""}</Pill>}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted">ยังไม่มีกิจกรรมที่จะมาถึง</p>}
        </Panel>
        {can(u, "registrations", "view") && (
          <Panel title="ผู้ลงทะเบียนที่ยังไม่ได้ติดต่อกลับ" actions={<Link href="/admin/registrations?status=NEW" className="text-sm underline">ดูทั้งหมด</Link>}>
            {regs.length ? (
              <ul className="divide-y divide-cream">
                {regs.map((r) => <li key={r.id} className="py-2"><span className="font-medium">{r.name}</span> <a href={`tel:${r.phone}`} className="text-brown underline num">{r.phone}</a> · {r.people} คน<span className="block text-sm text-muted">{r.event.title} · {thDateTime(r.createdAt)}</span></li>)}
              </ul>
            ) : <p className="text-muted">ติดต่อกลับครบแล้ว</p>}
          </Panel>
        )}
        {can(u, "messages", "view") && (
          <Panel title="ข้อความที่ยังไม่ได้อ่าน" actions={<Link href="/admin/messages" className="text-sm underline">เปิดกล่องข้อความ</Link>}>
            {msgs.length ? (
              <ul className="divide-y divide-cream">
                {msgs.map((m) => <li key={m.id} className="py-2"><span className="font-medium">{m.name}</span> · <span className="text-sm text-muted">{label(TOPIC, m.topic)} · {thDateTime(m.createdAt)}</span><span className="block truncate text-sm">{m.body}</span></li>)}
              </ul>
            ) : <p className="text-muted">ไม่มีข้อความใหม่</p>}
          </Panel>
        )}
      </div>
    </div>
  );
}
