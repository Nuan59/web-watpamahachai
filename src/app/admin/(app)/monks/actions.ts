"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { bool, done, file, int, str } from "../_ui";

export async function saveMonk(f: FormData) {
  const id = str(f, "id");
  const u = await requirePerm("monks", id ? "edit" : "create");
  const name = str(f, "name");
  if (!name) done("/admin/monks", { error: "ใส่ชื่อและฉายาก่อน" });
  const old = id ? await prisma.monk.findUnique({ where: { id } }) : null;
  let photoKey = old?.photoKey ?? null;
  const ph = file(f, "photo");
  if (ph) {
    try { photoKey = await saveUpload(ph, "public/monks"); } catch (e) { done("/admin/monks", { error: e instanceof UploadError ? e.message : "อัปโหลดรูปไม่สำเร็จ" }); }
    await removeUpload(old?.photoKey);
  } else if (bool(f, "removePhoto")) { await removeUpload(photoKey); photoKey = null; }
  const data = {
    name, photoKey, title: str(f, "title"), position: str(f, "position"), born: str(f, "born"), ordained: str(f, "ordained"),
    education: str(f, "education"), note: str(f, "note"), sort: int(f, "sort"), published: id ? bool(f, "published") : true,
  };
  const m = id ? await prisma.monk.update({ where: { id }, data }) : await prisma.monk.create({ data });
  await logActivity(u.id, id ? "update" : "create", "monk", m.id, m.name);
  done("/admin/monks", { ok: `บันทึก “${m.name}” แล้ว` });
}

export async function deleteMonk(f: FormData) {
  const u = await requirePerm("monks", "delete");
  const m = await prisma.monk.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (m) { await removeUpload(m.photoKey); await logActivity(u.id, "delete", "monk", m.id, m.name); }
  done("/admin/monks", { ok: "ลบแล้ว" });
}
