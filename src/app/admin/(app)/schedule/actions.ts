"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { done, int, str } from "../_ui";

export async function saveItem(f: FormData) {
  const id = str(f, "id");
  const u = await requirePerm("schedule", id ? "edit" : "create");
  const data = { category: str(f, "category"), time: str(f, "time"), title: str(f, "title"), sort: int(f, "sort") };
  if (!data.category || !data.time || !data.title) done("/admin/schedule", { error: "กรอกหมวด เวลา และกิจกรรมให้ครบ" });
  const it = id ? await prisma.scheduleItem.update({ where: { id }, data }) : await prisma.scheduleItem.create({ data });
  await logActivity(u.id, id ? "update" : "create", "schedule", it.id, `${it.category} ${it.time} ${it.title}`);
  done("/admin/schedule", { ok: "บันทึกแล้ว" });
}

export async function deleteItem(f: FormData) {
  const u = await requirePerm("schedule", "delete");
  const it = await prisma.scheduleItem.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (it) await logActivity(u.id, "delete", "schedule", it.id, `${it.category} ${it.time} ${it.title}`);
  done("/admin/schedule", { ok: "ลบแล้ว" });
}
