"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { bool, done, file, int, str } from "../_ui";

const up = async (f: File, folder: string, kind: "doc" | "image") => {
  try { return await saveUpload(f, folder, kind); } catch (e) { done("/admin/library", { error: e instanceof UploadError ? e.message : "อัปโหลดไม่สำเร็จ" }); }
};

/** Several files at once (titles from file names), or one with a link instead of a file. */
export async function addDocs(f: FormData) {
  const u = await requirePerm("library", "create");
  const category = str(f, "category") || "หนังสือสวดมนต์";
  const files = f.getAll("files").filter((x): x is File => x instanceof File && x.size > 0);
  const url = str(f, "url");
  if (!files.length && !url) done("/admin/library", { error: "เลือกไฟล์ PDF/ZIP หรือใส่ลิงก์อย่างใดอย่างหนึ่ง" });
  if (url && !/^https:\/\//.test(url)) done("/admin/library", { error: "ลิงก์ต้องขึ้นต้นด้วย https://" });
  const last = await prisma.libraryDoc.aggregate({ where: { category }, _max: { sort: true } });
  let sort = (last._max.sort ?? 0) + 1;
  if (!files.length) {
    const title = str(f, "title");
    if (!title) done("/admin/library", { error: "ใส่ชื่อหนังสือก่อน" });
    await prisma.libraryDoc.create({ data: { title, category, url, summary: str(f, "summary"), sort } });
    await logActivity(u.id, "create", "libraryDoc", null, title);
    done("/admin/library", { ok: `เพิ่ม “${title}” แล้ว` });
  }
  const bad: string[] = [];
  for (const fl of files.sort((a, b) => a.name.localeCompare(b.name, "th", { numeric: true }))) {
    try {
      const key = await saveUpload(fl, "public/library", "doc");
      const title = files.length === 1 && str(f, "title") ? str(f, "title") : fl.name.replace(/\.[^.]+$/, "").replace(/_+/g, " ").trim();
      await prisma.libraryDoc.create({ data: { title, category, fileKey: key, summary: files.length === 1 ? str(f, "summary") : "", sort: sort++ } });
    } catch (e) { bad.push(`${fl.name}: ${e instanceof UploadError ? e.message : "อัปโหลดไม่สำเร็จ"}`); }
  }
  await logActivity(u.id, "create", "libraryDoc", null, `${files.length - bad.length} ไฟล์ใน ${category}`);
  done("/admin/library", bad.length ? { error: `เพิ่ม ${files.length - bad.length} ไฟล์ ไม่สำเร็จ ${bad.length} ไฟล์ — ${bad.join(" · ")}` } : { ok: `เพิ่ม ${files.length} ไฟล์ในหมวด “${category}” แล้ว` });
}

export async function saveDoc(f: FormData) {
  const u = await requirePerm("library", "edit");
  const d = await prisma.libraryDoc.findUnique({ where: { id: str(f, "id") } });
  if (!d) done("/admin/library", { error: "ไม่พบรายการนี้" });
  const url = str(f, "url");
  if (url && !/^https:\/\//.test(url)) done("/admin/library", { error: "ลิงก์ต้องขึ้นต้นด้วย https://" });
  let { fileKey, coverKey } = d;
  const nf = file(f, "file"), nc = file(f, "cover");
  if (nf) { fileKey = (await up(nf, "public/library", "doc"))!; await removeUpload(d.fileKey); }
  if (nc) { coverKey = (await up(nc, "public/library-covers", "image"))!; await removeUpload(d.coverKey); }
  if (bool(f, "removeCover")) { await removeUpload(coverKey); coverKey = null; }
  if (!fileKey && !url) done("/admin/library", { error: "ต้องมีไฟล์หรือลิงก์อย่างใดอย่างหนึ่ง" });
  await prisma.libraryDoc.update({ where: { id: d.id }, data: { title: str(f, "title") || d.title, category: str(f, "category") || d.category, summary: str(f, "summary"), url, fileKey, coverKey, sort: int(f, "sort") } });
  await logActivity(u.id, "update", "libraryDoc", d.id, d.title);
  done("/admin/library", { ok: "บันทึกแล้ว" });
}

export async function deleteDoc(f: FormData) {
  const u = await requirePerm("library", "delete");
  const d = await prisma.libraryDoc.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (d) { await removeUpload(d.fileKey); await removeUpload(d.coverKey); await logActivity(u.id, "delete", "libraryDoc", d.id, d.title); }
  done("/admin/library", { ok: "ลบแล้ว" });
}
