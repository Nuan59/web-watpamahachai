import { requirePerm } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isoDay } from "@/lib/dates";
import { GENDER, REG_STATUS, label } from "@/lib/labels";
import { toCsv } from "@/lib/csv";

export async function GET(req: Request) {
  await requirePerm("registrations");
  const sp = new URL(req.url).searchParams;
  const eventId = sp.get("event") ?? "";
  const status = sp.get("status") ?? "";
  const regs = await prisma.registration.findMany({
    where: { ...(eventId ? { eventId } : {}), ...(status in REG_STATUS ? { status } : {}) },
    orderBy: [{ event: { startDate: "asc" } }, { createdAt: "asc" }],
    include: { event: { select: { title: true, startDate: true } } },
  });
  const csv = toCsv([
    ["กิจกรรม", "วันที่กิจกรรม", "ชื่อ", "โทร", "จำนวนคน", "อายุ", "เพศ", "หมายเหตุ", "สถานะ", "ลงทะเบียนเมื่อ"],
    ...regs.map((r) => [r.event.title, isoDay(r.event.startDate), r.name, r.phone, r.people, r.age ?? "", label(GENDER, r.gender), r.note, label(REG_STATUS, r.status), r.createdAt.toISOString()]),
  ]);
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="registrations-${isoDay(new Date())}.csv"`, "cache-control": "private, no-store" } });
}
