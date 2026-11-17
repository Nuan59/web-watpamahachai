import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { thDateTime, thRange, today } from "@/lib/dates";
import { GENDER, REG_STATUS, label } from "@/lib/labels";
import { ConfirmSubmit } from "@/components/form";
import { Flash, Head, Panel, Pill, TableWrap, type SP } from "../_ui";
import { deleteReg, setRegStatus } from "./actions";

export const metadata = { title: "ผู้ลงทะเบียน" };
const TONE = { NEW: "warn", CONFIRMED: "ok", CANCELLED: "grey" } as const;

export default async function Registrations({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("registrations");
  const sp = await searchParams;
  const eventId = sp.event ?? "";
  const status = sp.status && sp.status in REG_STATUS ? sp.status : "";
  const [events, regs] = await Promise.all([
    prisma.event.findMany({ where: { OR: [{ endDate: { gte: today() } }, { registrations: { some: {} } }] }, orderBy: { startDate: "desc" }, select: { id: true, title: true, startDate: true, endDate: true } }),
    prisma.registration.findMany({ where: { ...(eventId ? { eventId } : {}), ...(status ? { status } : {}) }, orderBy: { createdAt: "desc" }, take: 500, include: { event: { select: { title: true, startDate: true, endDate: true } } } }),
  ]);
  const people = regs.filter((r) => r.status !== "CANCELLED").reduce((n, r) => n + r.people, 0);
  const qs = new URLSearchParams({ ...(eventId ? { event: eventId } : {}), ...(status ? { status } : {}) }).toString();
  const back = `/admin/registrations${qs ? `?${qs}` : ""}`;
  return (
    <>
      <Head title="ผู้ลงทะเบียน" actions={<a href={`/admin/registrations/export${qs ? `?${qs}` : ""}`} className="btn btn-sm">ดาวน์โหลด Excel (CSV)</a>} />
      <Flash sp={sp} />
      <form className="mb-4 flex flex-wrap items-end gap-3">
        <label><span className="label">กิจกรรม</span>
          <select name="event" defaultValue={eventId} className="input min-w-64">
            <option value="">ทุกกิจกรรม</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title} ({thRange(e.startDate, e.endDate)})</option>)}
          </select>
        </label>
        <label><span className="label">สถานะ</span>
          <select name="status" defaultValue={status} className="input"><option value="">ทุกสถานะ</option>{Object.entries(REG_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <button className="btn">กรอง</button>
      </form>
      <Panel title={`${regs.length} รายการ · ${people} คน (ไม่นับที่ยกเลิก)`}>
        {regs.length ? (
          <TableWrap>
            <table className="tbl">
              <thead><tr><th>ชื่อ</th><th>โทร</th><th>คน</th><th>อายุ/เพศ</th><th>กิจกรรม</th><th>หมายเหตุ</th><th>สถานะ</th><th></th></tr></thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.name}<span className="block text-xs text-grey">{thDateTime(r.createdAt)}</span></td>
                    <td><a className="whitespace-nowrap text-brown underline num" href={`tel:${r.phone}`}>{r.phone}</a></td>
                    <td className="num">{r.people}</td>
                    <td className="whitespace-nowrap">{r.age ?? "—"} / {label(GENDER, r.gender)}</td>
                    <td><Link href={`/admin/registrations?event=${r.eventId}`} className="underline-offset-2 hover:underline">{r.event.title}</Link></td>
                    <td className="max-w-56 whitespace-pre-line text-muted">{r.note || "—"}</td>
                    <td><Pill tone={TONE[r.status as keyof typeof TONE] ?? "grey"}>{label(REG_STATUS, r.status)}</Pill></td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {can(u, "registrations", "edit") && Object.keys(REG_STATUS).filter((s) => s !== r.status).map((s) => (
                          <form key={s} action={setRegStatus}>
                            <input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value={s} /><input type="hidden" name="back" value={back} />
                            <button className="btn btn-sm whitespace-nowrap">{s === "CONFIRMED" ? "ยืนยัน" : s === "CANCELLED" ? "ยกเลิก" : "รอติดต่อ"}</button>
                          </form>
                        ))}
                        {can(u, "registrations", "delete") && (
                          <form action={deleteReg}><input type="hidden" name="id" value={r.id} /><ConfirmSubmit message={`ลบรายชื่อ ${r.name}?`}>ลบ</ConfirmSubmit></form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : <p className="text-muted">ยังไม่มีผู้ลงทะเบียน</p>}
      </Panel>
    </>
  );
}
