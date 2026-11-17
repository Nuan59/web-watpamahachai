"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { day } from "@/lib/dates";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { slugify } from "@/lib/text";
import { EVENT_KIND } from "@/lib/labels";
import type { SaveResult } from "@/components/form";
import { bool, done, file, optInt, str } from "../_ui";

export async function saveEvent(f: FormData): Promise<SaveResult> {
  const id = str(f, "id");
  const u = await requirePerm("events", id ? "edit" : "create");
  const title = str(f, "title");
  if (!title) return { error: "ใส่ชื่อกิจกรรมก่อน" };
  let startDate: Date, endDate: Date;
  try {
    startDate = day(str(f, "startDate"));
    endDate = day(str(f, "endDate") || str(f, "startDate"));
  } catch { return { error: "เลือกวันที่เริ่มกิจกรรม" }; }
  if (endDate < startDate) return { error: "วันสิ้นสุดอยู่ก่อนวันเริ่ม ตรวจวันที่อีกครั้ง" };
  const capacity = optInt(f, "capacity");
  if (capacity != null && capacity < 1) return { error: "จำนวนที่รับต้องมากกว่า ๐ หรือเว้นว่างถ้าไม่จำกัด" };
  const slug = slugify(str(f, "slug") || title);
  const clash = await prisma.event.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) return { error: `ลิงก์ /events/${slug} ใช้กับ “${clash.title}” แล้ว เปลี่ยนลิงก์ของกิจกรรมนี้` };
  const existing = id ? await prisma.event.findUnique({ where: { id } }) : null;
  if (id && !existing) done("/admin/events", { error: "ไม่พบกิจกรรมนี้" });
  let coverKey = existing?.coverKey ?? null;
  const cover = file(f, "cover");
  if (cover) {
    try { coverKey = await saveUpload(cover, "public/events"); } catch (e) { return { error: e instanceof UploadError ? e.message : "อัปโหลดรูปไม่สำเร็จ" }; }
    await removeUpload(existing?.coverKey);
  } else if (bool(f, "removeCover")) { await removeUpload(coverKey); coverKey = null; }
  const data = {
    title, slug, startDate, endDate, capacity, coverKey,
    kind: str(f, "kind") in EVENT_KIND ? str(f, "kind") : "OTHER",
    timeText: str(f, "timeText"), location: str(f, "location"), summary: str(f, "summary"), body: String(f.get("body") ?? ""),
    published: bool(f, "published"), signupOpen: bool(f, "signupOpen"),
  };
  const e = id ? await prisma.event.update({ where: { id }, data }) : await prisma.event.create({ data });
  await logActivity(u.id, id ? "update" : "create", "event", e.id, e.title);
  done(`/admin/events/${e.id}`, { ok: "บันทึกกิจกรรมแล้ว" });
}

export async function deleteEvent(f: FormData) {
  const u = await requirePerm("events", "delete");
  const id = str(f, "id");
  const regs = await prisma.registration.count({ where: { eventId: id } });
  if (regs > 0 && !bool(f, "withRegs")) done(`/admin/events/${id}`, { error: `กิจกรรมนี้มีผู้ลงทะเบียน ${regs} รายการ ติ๊ก “ลบรายชื่อผู้ลงทะเบียนด้วย” แล้วลบอีกครั้ง หรือซ่อนกิจกรรมแทน` });
  const e = await prisma.event.delete({ where: { id } }).catch(() => null);
  if (e) { await removeUpload(e.coverKey); await logActivity(u.id, "delete", "event", id, e.title); }
  done("/admin/events", { ok: "ลบกิจกรรมแล้ว" });
}
