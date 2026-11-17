import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { thRange, today } from "@/lib/dates";
import { EVENT_KIND, label } from "@/lib/labels";
import { Flash, Head, Panel, Pill, TableWrap, type SP } from "../_ui";

export const metadata = { title: "กิจกรรม" };

export default async function EventsAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("events");
  const sp = await searchParams;
  const past = sp.show === "past";
  const t = today();
  const events = await prisma.event.findMany({
    where: past ? { endDate: { lt: t } } : { endDate: { gte: t } },
    orderBy: { startDate: past ? "desc" : "asc" },
    include: { _count: { select: { registrations: { where: { status: { not: "CANCELLED" } } } } } },
  });
  return (
    <>
      <Head title="กิจกรรม" actions={can(u, "events", "create") && <Link href="/admin/events/new" className="btn btn-primary btn-sm">+ เพิ่มกิจกรรม</Link>} />
      <Flash sp={sp} />
      <p className="mb-3 flex gap-2 text-sm">
        <Link href="/admin/events" aria-current={!past ? "page" : undefined} className="btn btn-sm aria-[current=page]:border-brown aria-[current=page]:text-brown">ที่จะมาถึง</Link>
        <Link href="/admin/events?show=past" aria-current={past ? "page" : undefined} className="btn btn-sm aria-[current=page]:border-brown aria-[current=page]:text-brown">ผ่านไปแล้ว</Link>
      </p>
      <Panel>
        {events.length ? (
          <TableWrap>
            <table className="tbl">
              <thead><tr><th>กิจกรรม</th><th>วันที่</th><th>ประเภท</th><th>ลงทะเบียน</th><th>สถานะ</th></tr></thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td><Link href={`/admin/events/${e.id}`} className="font-medium underline-offset-2 hover:underline">{e.title}</Link></td>
                    <td className="whitespace-nowrap">{thRange(e.startDate, e.endDate)}</td>
                    <td>{label(EVENT_KIND, e.kind)}</td>
                    <td className="num">{e.signupOpen || e._count.registrations ? `${e._count.registrations}${e.capacity != null ? ` / ${e.capacity}` : ""}` : "—"}</td>
                    <td className="space-x-1">{e.published ? <Pill tone="ok">แสดง</Pill> : <Pill>ซ่อน</Pill>}{e.signupOpen && <Pill tone="brown">เปิดลงทะเบียน</Pill>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : <p className="text-muted">{past ? "ยังไม่มีกิจกรรมที่ผ่านมา" : "ยังไม่มีกิจกรรมที่จะมาถึง"}</p>}
      </Panel>
    </>
  );
}
