import { requirePerm } from "@/lib/auth";
import { ROLES } from "@/lib/permissions";
import { ROLE } from "@/lib/labels";
import { Submit } from "@/components/form";
import { Field, Flash, Head, Panel, type SP } from "../../_ui";
import { createUser } from "../actions";

export const metadata = { title: "เพิ่มบัญชี" };

export default async function NewUser({ searchParams }: { searchParams: SP }) {
  const me = await requirePerm("users", "create");
  return (
    <div className="max-w-lg">
      <Head title="เพิ่มบัญชี" crumbs={[["ผู้ใช้และสิทธิ์", "/admin/users"], ["เพิ่ม"]]} />
      <Flash sp={await searchParams} />
      <Panel>
        <form action={createUser} className="space-y-4">
          <Field label="ชื่อที่แสดง"><input name="name" required className="input" /></Field>
          <Field label="อีเมล (ใช้เข้าสู่ระบบ)"><input name="email" type="email" required className="input" /></Field>
          <Field label="บทบาท"><select name="role" defaultValue="EDITOR" className="input">{ROLES.filter((r) => r !== "OWNER" || me.role === "OWNER").map((r) => <option key={r} value={r}>{ROLE[r]}</option>)}</select></Field>
          <Field label="รหัสผ่านเริ่มต้น" hint="อย่างน้อย ๘ ตัวอักษร ให้เจ้าของบัญชีเปลี่ยนเองหลังเข้าครั้งแรก"><input name="password" type="text" required minLength={8} autoComplete="off" className="input" /></Field>
          <Submit>สร้างบัญชี</Submit>
        </form>
      </Panel>
    </div>
  );
}
