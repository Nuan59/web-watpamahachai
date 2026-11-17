import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ROLE, label } from "@/lib/labels";
import { Flash, Head, Panel, Pill, TableWrap, type SP } from "../_ui";

export const metadata = { title: "ผู้ใช้และสิทธิ์" };

export default async function Users({ searchParams }: { searchParams: SP }) {
  const me = await requirePerm("users");
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { role: "asc" }, { name: "asc" }] });
  return (
    <>
      <Head title="ผู้ใช้และสิทธิ์" actions={can(me, "users", "create") && <Link href="/admin/users/new" className="btn btn-primary btn-sm">+ เพิ่มบัญชี</Link>} />
      <Flash sp={await searchParams} />
      <Panel>
        <TableWrap>
          <table className="tbl">
            <thead><tr><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>สถานะ</th></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id}>
                <td><Link href={`/admin/users/${u.id}`} className="font-medium underline-offset-2 hover:underline">{u.name}</Link>{u.id === me.id && <span className="text-sm text-muted"> (คุณ)</span>}</td>
                <td>{u.email}</td>
                <td>{label(ROLE, u.role)}{u.perms !== "{}" && <span className="text-sm text-muted"> · กำหนดสิทธิ์เอง</span>}</td>
                <td>{u.active ? <Pill tone="ok">ใช้งาน</Pill> : <Pill>ปิดใช้งาน</Pill>}</td>
              </tr>
            ))}</tbody>
          </table>
        </TableWrap>
      </Panel>
      <div className="mt-5 grid gap-3 text-sm text-muted md:grid-cols-3">
        <p><b className="text-ink">เจ้าของระบบ</b> ทำได้ทุกอย่าง รวมถึงข้อมูลวัดและบัญชีผู้ใช้</p>
        <p><b className="text-ink">เจ้าหน้าที่วัด</b> ดูแลเนื้อหาทั้งหมด ผู้ลงทะเบียน และข้อความติดต่อ</p>
        <p><b className="text-ink">อาสาสมัครดูแลเนื้อหา</b> เขียนข่าว อัปโหลดภาพและเสียงธรรม ลบไม่ได้</p>
      </div>
    </>
  );
}
