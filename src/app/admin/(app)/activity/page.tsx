import { requirePerm } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { thDateTime } from "@/lib/dates";
import { Head, Panel, TableWrap } from "../_ui";

export const metadata = { title: "ประวัติการใช้งาน" };
const ACT: Record<string, string> = { login: "เข้าสู่ระบบ", create: "เพิ่ม", update: "แก้ไข", delete: "ลบ" };

export default async function Activity() {
  await requirePerm("users");
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { user: { select: { name: true } } } });
  return (
    <>
      <Head title="ประวัติการใช้งาน" />
      <Panel title="๓๐๐ รายการล่าสุด">
        <TableWrap>
          <table className="tbl">
            <thead><tr><th>เวลา</th><th>ผู้ใช้</th><th>ทำอะไร</th><th>ส่วน</th><th>รายละเอียด</th></tr></thead>
            <tbody>{logs.map((l) => (
              <tr key={l.id}><td className="whitespace-nowrap">{thDateTime(l.createdAt)}</td><td>{l.user?.name ?? "—"}</td><td>{ACT[l.action] ?? l.action}</td><td>{l.entity}</td><td className="text-muted">{l.detail}</td></tr>
            ))}</tbody>
          </table>
        </TableWrap>
      </Panel>
    </>
  );
}
