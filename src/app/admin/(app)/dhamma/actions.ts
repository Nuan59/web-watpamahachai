"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { audioSrc } from "@/lib/text";
import { bool, done, file, int, str } from "../_ui";

export async function saveTrack(f: FormData) {
  const id = str(f, "id");
  const u = await requirePerm("dhamma", id ? "edit" : "create");
  const title = str(f, "title");
  if (!title) done("/admin/dhamma", { error: "ใส่ชื่อเรื่องก่อน" });
  const existing = id ? await prisma.audioTrack.findUnique({ where: { id } }) : null;
  let fileKey = existing?.fileKey ?? null;
  const up = file(f, "file");
  if (up) {
    try { fileKey = await saveUpload(up, "public/audio", "audio"); } catch (e) { done("/admin/dhamma", { error: e instanceof UploadError ? e.message : "อัปโหลดไฟล์เสียงไม่สำเร็จ" }); }
    await removeUpload(existing?.fileKey);
  }
  const url = str(f, "url");
  if (!audioSrc({ fileKey, url })) done("/admin/dhamma", { error: "แนบไฟล์เสียง หรือใส่ลิงก์ Google Drive / ลิงก์ไฟล์เสียง" });
  const featured = bool(f, "featured");
  const data = { title, url, fileKey, featured, speaker: str(f, "speaker"), category: str(f, "category") || "ธรรมบรรยาย", sort: int(f, "sort") };
  const t = await prisma.$transaction(async (tx) => {
    if (featured) await tx.audioTrack.updateMany({ where: { featured: true }, data: { featured: false } });
    return id ? tx.audioTrack.update({ where: { id }, data }) : tx.audioTrack.create({ data });
  });
  await logActivity(u.id, id ? "update" : "create", "audio", t.id, t.title);
  done("/admin/dhamma", { ok: `บันทึก “${t.title}” แล้ว` });
}

export async function deleteTrack(f: FormData) {
  const u = await requirePerm("dhamma", "delete");
  const t = await prisma.audioTrack.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (t) { await removeUpload(t.fileKey); await logActivity(u.id, "delete", "audio", t.id, t.title); }
  done("/admin/dhamma", { ok: "ลบเสียงธรรมแล้ว" });
}

export async function addQuote(f: FormData) {
  const u = await requirePerm("dhamma", "create");
  const text = str(f, "text");
  if (!text) done("/admin/dhamma", { error: "ใส่ข้อความโอวาทก่อน" });
  const q = await prisma.quote.create({ data: { text, author: str(f, "author") } });
  await logActivity(u.id, "create", "quote", q.id, text.slice(0, 60));
  done("/admin/dhamma", { ok: "เพิ่มโอวาทแล้ว จะแสดงเป็นโอวาทล่าสุดที่หน้าแรก" });
}

export async function deleteQuote(f: FormData) {
  const u = await requirePerm("dhamma", "delete");
  const q = await prisma.quote.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (q) await logActivity(u.id, "delete", "quote", q.id, q.text.slice(0, 60));
  done("/admin/dhamma", { ok: "ลบโอวาทแล้ว" });
}
