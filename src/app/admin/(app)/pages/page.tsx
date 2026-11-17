import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { Flash, Head, Panel, Pill, TableWrap, type SP } from "../_ui";

export const metadata = { title: "หน้าเนื้อหา" };

export default async function PagesAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("pages");
  const pages = await prisma.page.findMany({ orderBy: [{ navGroup: "asc" }, { sort: "asc" }] });
  return (
    <>
      <Head title="หน้าเนื้อหา" actions={can(u, "pages", "create") && <Link href="/admin/pages/new" className="btn btn-primary btn-sm">+ สร้างหน้า</Link>} />
      <Flash sp={await searchParams} />
      <p className="mb-4 hint">หน้าเพิ่มเติม เช่น ประวัติหลวงพ่อ ระเบียบการบวช หรือโครงการพิเศษ เลือกได้ว่าจะให้อยู่ใต้เมนูไหน</p>
      <Panel>
        {pages.length ? (
          <TableWrap>
            <table className="tbl">
              <thead><tr><th>ชื่อหน้า</th><th>ลิงก์</th><th>เมนู</th><th>สถานะ</th></tr></thead>
              <tbody>{pages.map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/admin/pages/${p.id}`} className="font-medium underline-offset-2 hover:underline">{p.title}</Link></td>
                  <td className="text-muted">/p/{p.slug}</td><td>{p.navGroup || "—"}</td>
                  <td>{p.published ? <Pill tone="ok">แสดง</Pill> : <Pill>ซ่อน</Pill>}</td>
                </tr>
              ))}</tbody>
            </table>
          </TableWrap>
        ) : <p className="text-muted">ยังไม่มีหน้าเพิ่มเติม</p>}
      </Panel>
    </>
  );
}
