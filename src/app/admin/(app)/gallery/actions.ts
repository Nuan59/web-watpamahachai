"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { day } from "@/lib/dates";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { slugify } from "@/lib/text";
import { bool, done, int, str } from "../_ui";

const date = (s: string) => { try { return s ? day(s) : null; } catch { return null; } };

export async function saveAlbum(f: FormData) {
  const id = str(f, "id");
  const u = await requirePerm("gallery", id ? "edit" : "create");
  const back = id ? `/admin/gallery/${id}` : "/admin/gallery";
  const title = str(f, "title");
  if (!title) done(back, { error: "ใส่ชื่ออัลบั้มก่อน" });
  const slug = slugify(str(f, "slug") || title);
  const clash = await prisma.album.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) done(back, { error: `ลิงก์ /gallery/${slug} ใช้กับอัลบั้ม “${clash.title}” แล้ว` });
  const data = { title, slug, date: date(str(f, "date")), summary: str(f, "summary"), published: id ? bool(f, "published") : true };
  const a = id ? await prisma.album.update({ where: { id }, data }) : await prisma.album.create({ data });
  await logActivity(u.id, id ? "update" : "create", "album", a.id, a.title);
  done(`/admin/gallery/${a.id}`, { ok: id ? "บันทึกอัลบั้มแล้ว" : "สร้างอัลบั้มแล้ว เพิ่มภาพได้เลย" });
}

export async function uploadPhotos(f: FormData) {
  const u = await requirePerm("gallery", "create");
  const albumId = str(f, "albumId");
  const back = `/admin/gallery/${albumId}`;
  const files = f.getAll("photos").filter((x): x is File => x instanceof File && x.size > 0);
  if (!files.length) done(back, { error: "ยังไม่ได้เลือกภาพ" });
  const last = await prisma.photo.aggregate({ where: { albumId }, _max: { sort: true } });
  let sort = (last._max.sort ?? 0) + 1;
  const bad: string[] = [];
  for (const file of files) {
    try {
      const key = await saveUpload(file, "public/gallery");
      await prisma.photo.create({ data: { albumId, key, sort: sort++ } });
    } catch (e) { bad.push(`${file.name}: ${e instanceof UploadError ? e.message : "อัปโหลดไม่สำเร็จ"}`); }
  }
  await logActivity(u.id, "create", "photo", albumId, `${files.length - bad.length} ภาพ`);
  done(back, bad.length ? { error: `เพิ่ม ${files.length - bad.length} ภาพ ไม่สำเร็จ ${bad.length} ภาพ — ${bad.join(" · ")}` } : { ok: `เพิ่ม ${files.length} ภาพแล้ว` });
}

export async function savePhoto(f: FormData) {
  await requirePerm("gallery", "edit");
  const p = await prisma.photo.update({ where: { id: str(f, "id") }, data: { caption: str(f, "caption"), sort: int(f, "sort") } });
  done(`/admin/gallery/${p.albumId}`, { ok: "บันทึกคำบรรยายภาพแล้ว" });
}

export async function deletePhoto(f: FormData) {
  const u = await requirePerm("gallery", "delete");
  const p = await prisma.photo.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (!p) done("/admin/gallery", { error: "ไม่พบภาพนี้" });
  await removeUpload(p.key);
  await logActivity(u.id, "delete", "photo", p.id, p.albumId);
  done(`/admin/gallery/${p.albumId}`, { ok: "ลบภาพแล้ว" });
}

export async function deleteAlbum(f: FormData) {
  const u = await requirePerm("gallery", "delete");
  const a = await prisma.album.findUnique({ where: { id: str(f, "id") }, include: { photos: true } });
  if (!a) done("/admin/gallery", { error: "ไม่พบอัลบั้มนี้" });
  await prisma.album.delete({ where: { id: a.id } });
  await Promise.all(a.photos.map((p) => removeUpload(p.key)));
  await logActivity(u.id, "delete", "album", a.id, `${a.title} (${a.photos.length} ภาพ)`);
  done("/admin/gallery", { ok: "ลบอัลบั้มแล้ว" });
}
