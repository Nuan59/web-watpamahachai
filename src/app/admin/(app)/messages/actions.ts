"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { done, str } from "../_ui";

export async function toggleRead(f: FormData) {
  await requirePerm("messages", "edit");
  const m = await prisma.message.findUnique({ where: { id: str(f, "id") } });
  if (m) await prisma.message.update({ where: { id: m.id }, data: { readAt: m.readAt ? null : new Date() } });
  done("/admin/messages", { ok: m?.readAt ? "ทำเป็นยังไม่อ่านแล้ว" : "ทำเป็นอ่านแล้ว" });
}

export async function deleteMessage(f: FormData) {
  const u = await requirePerm("messages", "delete");
  const m = await prisma.message.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (m) await logActivity(u.id, "delete", "message", m.id, m.name);
  done("/admin/messages", { ok: "ลบข้อความแล้ว" });
}
