"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { audioSrc, slugify } from "@/lib/text";
import { bool, done, file, int, str } from "../_ui";

/** Forms inside a series page send back=/admin/dhamma/<id>. */
const back = (f: FormData) => (/^\/admin\/dhamma(\/[\w-]+)?$/.test(str(f, "back")) ? str(f, "back") : "/admin/dhamma");

export async function saveTrack(f: FormData) {
  const id = str(f, "id");
  const u = await requirePerm("dhamma", id ? "edit" : "create");
  const title = str(f, "title");
  if (!title) done(back(f), { error: "ใส่ชื่อเรื่องก่อน" });
  const existing = id ? await prisma.audioTrack.findUnique({ where: { id } }) : null;
  let fileKey = existing?.fileKey ?? null;
  const up = file(f, "file");
  if (up) {
    try { fileKey = await saveUpload(up, "public/audio", "audio"); } catch (e) { done(back(f), { error: e instanceof UploadError ? e.message : "อัปโหลดไฟล์เสียงไม่สำเร็จ" }); }
    await removeUpload(existing?.fileKey);
  }
  const url = str(f, "url");
  if (!audioSrc({ fileKey, url })) done(back(f), { error: "แนบไฟล์เสียง หรือใส่ลิงก์ Google Drive / ลิงก์ไฟล์เสียง" });
  const featured = bool(f, "featured");
  const seriesId = str(f, "seriesId") || null;
  const data = { title, url, fileKey, featured, seriesId, downloadable: bool(f, "downloadable"), speaker: str(f, "speaker"), category: str(f, "category") || "ธรรมบรรยาย", sort: int(f, "sort") };
  const t = await prisma.$transaction(async (tx) => {
    if (featured) await tx.audioTrack.updateMany({ where: { featured: true }, data: { featured: false } });
    return id ? tx.audioTrack.update({ where: { id }, data }) : tx.audioTrack.create({ data });
  });
  await logActivity(u.id, id ? "update" : "create", "audio", t.id, t.title);
  done(back(f), { ok: `บันทึก “${t.title}” แล้ว` });
}

export async function deleteTrack(f: FormData) {
  const u = await requirePerm("dhamma", "delete");
  const t = await prisma.audioTrack.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (t) { await removeUpload(t.fileKey); await logActivity(u.id, "delete", "audio", t.id, t.title); }
  done(back(f), { ok: "ลบเสียงธรรมแล้ว" });
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

export async function saveSeries(f: FormData) {
  const id = str(f, "id");
  const u = await requirePerm("dhamma", id ? "edit" : "create");
  const to = id ? `/admin/dhamma/${id}` : "/admin/dhamma";
  const title = str(f, "title");
  if (!title) done(to, { error: "ใส่ชื่อชุดเสียงธรรมก่อน" });
  const slug = slugify(str(f, "slug") || title);
  const clash = await prisma.audioSeries.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) done(to, { error: `ลิงก์ /dhamma/${slug} ใช้กับชุด “${clash.title}” แล้ว` });
  const old = id ? await prisma.audioSeries.findUnique({ where: { id } }) : null;
  let coverKey = old?.coverKey ?? null, zipKey = old?.zipKey ?? null;
  const cover = file(f, "cover"), zip = file(f, "zip");
  try {
    if (cover) { coverKey = await saveUpload(cover, "public/audio-covers"); await removeUpload(old?.coverKey); }
    if (zip) { zipKey = await saveUpload(zip, "public/audio-zip", "doc"); await removeUpload(old?.zipKey); }
  } catch (e) { done(to, { error: e instanceof UploadError ? e.message : "อัปโหลดไฟล์ไม่สำเร็จ" }); }
  if (bool(f, "removeZip")) { await removeUpload(zipKey); zipKey = null; }
  const zipUrl = str(f, "zipUrl");
  if (zipUrl && !/^https:\/\//.test(zipUrl)) done(to, { error: "ลิงก์ไฟล์รวมทั้งชุดต้องขึ้นต้นด้วย https://" });
  const data = { title, slug, speaker: str(f, "speaker"), summary: str(f, "summary"), coverKey, zipKey, zipUrl, sort: int(f, "sort"), published: id ? bool(f, "published") : true };
  const x = id ? await prisma.audioSeries.update({ where: { id }, data }) : await prisma.audioSeries.create({ data });
  await logActivity(u.id, id ? "update" : "create", "audioSeries", x.id, x.title);
  done(`/admin/dhamma/${x.id}`, { ok: id ? "บันทึกชุดเสียงธรรมแล้ว" : "สร้างชุดแล้ว เพิ่มไฟล์เสียงได้เลย" });
}

/** Many files at once; each title comes from its file name (without the extension). */
export async function addSeriesTracks(f: FormData) {
  const u = await requirePerm("dhamma", "create");
  const seriesId = str(f, "seriesId");
  const to = `/admin/dhamma/${seriesId}`;
  const s = await prisma.audioSeries.findUnique({ where: { id: seriesId }, include: { _count: { select: { tracks: true } } } });
  if (!s) done("/admin/dhamma", { error: "ไม่พบชุดเสียงธรรมนี้" });
  const files = f.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);
  if (!files.length) done(to, { error: "ยังไม่ได้เลือกไฟล์เสียง" });
  let sort = s._count.tracks;
  const bad: string[] = [];
  for (const fl of files.sort((a, b) => a.name.localeCompare(b.name, "th", { numeric: true }))) {
    try {
      const key = await saveUpload(fl, "public/audio", "audio");
      const title = fl.name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").trim() || "ไม่มีชื่อ";
      await prisma.audioTrack.create({ data: { seriesId, title, fileKey: key, speaker: s.speaker, category: s.title, sort: ++sort } });
    } catch (e) { bad.push(`${fl.name}: ${e instanceof UploadError ? e.message : "อัปโหลดไม่สำเร็จ"}`); }
  }
  await logActivity(u.id, "create", "audio", seriesId, `${files.length - bad.length} ไฟล์ใน ${s.title}`);
  done(to, bad.length ? { error: `เพิ่ม ${files.length - bad.length} ไฟล์ ไม่สำเร็จ ${bad.length} ไฟล์ — ${bad.join(" · ")}` } : { ok: `เพิ่ม ${files.length} ไฟล์แล้ว แก้ชื่อตอนได้ที่รายการด้านล่าง` });
}

export async function deleteSeries(f: FormData) {
  const u = await requirePerm("dhamma", "delete");
  const s = await prisma.audioSeries.findUnique({ where: { id: str(f, "id") }, include: { tracks: true } });
  if (!s) done("/admin/dhamma", { error: "ไม่พบชุดเสียงธรรมนี้" });
  const withTracks = bool(f, "withTracks");
  if (withTracks) {
    await prisma.audioTrack.deleteMany({ where: { seriesId: s.id } });
    await Promise.all(s.tracks.map((t) => removeUpload(t.fileKey)));
  }
  await prisma.audioSeries.delete({ where: { id: s.id } });
  await Promise.all([removeUpload(s.coverKey), removeUpload(s.zipKey)]);
  await logActivity(u.id, "delete", "audioSeries", s.id, `${s.title}${withTracks ? ` และ ${s.tracks.length} ไฟล์` : ""}`);
  done("/admin/dhamma", { ok: withTracks ? "ลบชุดและไฟล์เสียงแล้ว" : "ลบชุดแล้ว ไฟล์เสียงย้ายไปอยู่ใน “เสียงธรรมอื่น ๆ”" });
}
