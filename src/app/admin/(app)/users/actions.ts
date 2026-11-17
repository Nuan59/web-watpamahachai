"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { hashPassword } from "@/lib/session";
import { ACTIONS, grantable, MODULES, ROLES } from "@/lib/permissions";
import { ROLE } from "@/lib/labels";
import { bool, done, str } from "../_ui";

/** Only the owner may create or change owner accounts. */
const mayRole = (me: { role: string }, role: string) => (ROLES as readonly string[]).includes(role) && (role !== "OWNER" || me.role === "OWNER");

export async function createUser(f: FormData) {
  const me = await requirePerm("users", "create");
  const email = str(f, "email").toLowerCase(), name = str(f, "name"), role = str(f, "role"), pw = str(f, "password");
  if (!email || !name) done("/admin/users/new", { error: "กรอกชื่อและอีเมลให้ครบ" });
  if (!mayRole(me, role)) done("/admin/users/new", { error: "บัญชีนี้ตั้งบทบาทนั้นไม่ได้" });
  if (pw.length < 8) done("/admin/users/new", { error: "รหัสผ่านต้องยาวอย่างน้อย ๘ ตัวอักษร" });
  if (await prisma.user.findUnique({ where: { email } })) done("/admin/users/new", { error: "อีเมลนี้มีบัญชีอยู่แล้ว" });
  const u = await prisma.user.create({ data: { email, name, role, passwordHash: await hashPassword(pw) } });
  await logActivity(me.id, "create", "user", u.id, `${u.name} (${ROLE[role]})`);
  done(`/admin/users/${u.id}`, { ok: "สร้างบัญชีแล้ว แจ้งอีเมลและรหัสผ่านให้เจ้าของบัญชี และให้เปลี่ยนรหัสผ่านเมื่อเข้าครั้งแรก" });
}

export async function updateUser(f: FormData) {
  const me = await requirePerm("users", "edit");
  const id = str(f, "id");
  const back = `/admin/users/${id}`;
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) done("/admin/users", { error: "ไม่พบบัญชีนี้" });
  if (u.role === "OWNER" && me.role !== "OWNER") done(back, { error: "เฉพาะเจ้าของระบบแก้บัญชีเจ้าของระบบได้" });
  const role = str(f, "role");
  if (!mayRole(me, role)) done(back, { error: "บัญชีนี้ตั้งบทบาทนั้นไม่ได้" });
  const active = bool(f, "active");
  if (u.id === me.id && (!active || role !== u.role)) done(back, { error: "ปิดหรือเปลี่ยนบทบาทบัญชีของตัวเองไม่ได้ ให้เจ้าของระบบอีกคนทำแทน" });
  if (u.role === "OWNER" && (role !== "OWNER" || !active) && (await prisma.user.count({ where: { role: "OWNER", active: true } })) <= 1) done(back, { error: "ต้องมีเจ้าของระบบที่ใช้งานได้อย่างน้อย ๑ บัญชี" });
  let perms = "{}";
  if (bool(f, "custom")) {
    const wanted = Object.fromEntries(MODULES.map((m) => [m, Object.values(ACTIONS).filter((c) => f.get(`p_${m}_${c}`) === "1").join("")]));
    perms = JSON.stringify(grantable(me, wanted));
  }
  const pw = str(f, "password");
  if (pw && pw.length < 8) done(back, { error: "รหัสผ่านใหม่ต้องยาวอย่างน้อย ๘ ตัวอักษร" });
  await prisma.user.update({ where: { id }, data: { name: str(f, "name") || u.name, role, active, perms, ...(pw ? { passwordHash: await hashPassword(pw) } : {}) } });
  await logActivity(me.id, "update", "user", id, `${u.name}: ${ROLE[role]}${active ? "" : " (ปิดใช้งาน)"}${perms !== "{}" ? " สิทธิ์กำหนดเอง" : ""}${pw ? " ตั้งรหัสผ่านใหม่" : ""}`);
  done(back, { ok: "บันทึกบัญชีแล้ว" });
}
