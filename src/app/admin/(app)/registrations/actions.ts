"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { REG_STATUS } from "@/lib/labels";
import { done, str } from "../_ui";

export async function setRegStatus(f: FormData) {
  const u = await requirePerm("registrations", "edit");
  const status = str(f, "status");
  const back = str(f, "back") || "/admin/registrations";
  const safeBack = back.startsWith("/admin/registrations") ? back : "/admin/registrations";
  if (!(status in REG_STATUS)) done(safeBack, { error: "สถานะไม่ถูกต้อง" });
  const r = await prisma.registration.update({ where: { id: str(f, "id") }, data: { status } }).catch(() => null);
  if (r) await logActivity(u.id, "update", "registration", r.id, `${r.name} → ${REG_STATUS[status]}`);
  done(safeBack, { ok: r ? `${r.name}: ${REG_STATUS[status]}` : "ไม่พบรายการนี้" });
}

export async function deleteReg(f: FormData) {
  const u = await requirePerm("registrations", "delete");
  const r = await prisma.registration.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (r) await logActivity(u.id, "delete", "registration", r.id, r.name);
  done("/admin/registrations", { ok: "ลบรายการแล้ว" });
}
