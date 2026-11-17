import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { can, effectivePerms, ACTIONS, MODULES, MODULE_LABEL, ROLES } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ROLE } from "@/lib/labels";
import { Submit } from "@/components/form";
import { Check, Field, Flash, Head, Panel, TableWrap, type SP } from "../../_ui";
import { updateUser } from "../actions";

export const metadata = { title: "บัญชีผู้ใช้" };
const ACT_LABEL = { v: "ดู", c: "เพิ่ม", e: "แก้ไข", d: "ลบ" } as const;

export default async function UserPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const me = await requirePerm("users");
  const u = await prisma.user.findUnique({ where: { id: (await params).id } });
  if (!u) notFound();
  const editable = can(me, "users", "edit") && (u.role !== "OWNER" || me.role === "OWNER");
  const eff = effectivePerms(u);
  const mine = effectivePerms(me);
  return (
    <div className="max-w-3xl">
      <Head title={u.name} crumbs={[["ผู้ใช้และสิทธิ์", "/admin/users"], [u.name]]} />
      <Flash sp={await searchParams} />
      <form action={updateUser} className="space-y-5">
        <input type="hidden" name="id" value={u.id} />
        <Panel title="บัญชี">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อที่แสดง"><input name="name" defaultValue={u.name} disabled={!editable} className="input" /></Field>
            <Field label="อีเมล"><input value={u.email} readOnly className="input bg-cream" /></Field>
            <Field label="บทบาท"><select name="role" defaultValue={u.role} disabled={!editable} className="input">{ROLES.filter((r) => r !== "OWNER" || me.role === "OWNER" || u.role === "OWNER").map((r) => <option key={r} value={r}>{ROLE[r]}</option>)}</select></Field>
            <Field label="ตั้งรหัสผ่านใหม่" hint="เว้นว่าง = ไม่เปลี่ยน"><input name="password" type="text" minLength={8} autoComplete="off" disabled={!editable} className="input" /></Field>
            <Check name="active" label="เปิดใช้งานบัญชี" defaultChecked={u.active} />
          </div>
        </Panel>
        {u.role !== "OWNER" && (
          <Panel title="สิทธิ์รายส่วน">
            <Check name="custom" label="กำหนดสิทธิ์เอง (ไม่ใช้ค่าตั้งต้นของบทบาท)" defaultChecked={u.perms !== "{}"} />
            <p className="hint mb-3">ตารางแสดงสิทธิ์ที่ใช้อยู่ตอนนี้ ติ๊ก “กำหนดสิทธิ์เอง” แล้วปรับช่องที่ต้องการ ให้สิทธิ์ได้เฉพาะที่บัญชีของคุณมี</p>
            <TableWrap>
              <table className="tbl">
                <thead><tr><th>ส่วน</th>{Object.values(ACT_LABEL).map((l) => <th key={l} className="text-center">{l}</th>)}</tr></thead>
                <tbody>{MODULES.map((m) => (
                  <tr key={m}>
                    <td>{MODULE_LABEL[m]}</td>
                    {Object.values(ACTIONS).map((c) => (
                      <td key={c} className="text-center">
                        <input type="checkbox" name={`p_${m}_${c}`} value="1" defaultChecked={eff[m].includes(c)} disabled={!editable || !mine[m].includes(c)} aria-label={`${MODULE_LABEL[m]} ${ACT_LABEL[c]}`} className="h-5 w-5 accent-[#744a24]" />
                      </td>
                    ))}
                  </tr>
                ))}</tbody>
              </table>
            </TableWrap>
          </Panel>
        )}
        {editable && <Submit>บันทึกบัญชี</Submit>}
      </form>
    </div>
  );
}
