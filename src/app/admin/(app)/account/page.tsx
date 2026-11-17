import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { Submit } from "@/components/form";
import { done, Field, Flash, Head, Panel, str, type SP } from "../_ui";

export const metadata = { title: "เปลี่ยนรหัสผ่าน" };

// Any signed-in account may change its own password; no section permission needed.
async function changePassword(f: FormData) {
  "use server";
  const u = await getUser();
  if (!u) redirect("/admin/login");
  if (!(await verifyPassword(str(f, "current"), u.passwordHash))) done("/admin/account", { error: "รหัสผ่านเดิมไม่ถูกต้อง" });
  const next = str(f, "next");
  if (next.length < 8) done("/admin/account", { error: "รหัสผ่านใหม่ต้องยาวอย่างน้อย ๘ ตัวอักษร" });
  if (next !== str(f, "confirm")) done("/admin/account", { error: "รหัสผ่านใหม่สองช่องไม่ตรงกัน" });
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(next) } });
  await logActivity(u.id, "update", "user", u.id, "เปลี่ยนรหัสผ่านตัวเอง");
  done("/admin/account", { ok: "เปลี่ยนรหัสผ่านแล้ว" });
}

export default async function Account({ searchParams }: { searchParams: SP }) {
  const u = await getUser();
  if (!u) redirect("/admin/login");
  return (
    <div className="max-w-md">
      <Head title="เปลี่ยนรหัสผ่าน" />
      <Flash sp={await searchParams} />
      <Panel>
        <form action={changePassword} className="space-y-4">
          <p className="text-sm text-muted">{u.name} · {u.email}</p>
          <Field label="รหัสผ่านเดิม"><input name="current" type="password" required autoComplete="current-password" className="input" /></Field>
          <Field label="รหัสผ่านใหม่" hint="อย่างน้อย ๘ ตัวอักษร"><input name="next" type="password" required minLength={8} autoComplete="new-password" className="input" /></Field>
          <Field label="พิมพ์รหัสผ่านใหม่อีกครั้ง"><input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" /></Field>
          <Submit>บันทึกรหัสผ่านใหม่</Submit>
        </form>
      </Panel>
    </div>
  );
}
