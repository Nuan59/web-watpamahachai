"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { safeLink } from "@/lib/slides";
import { bool, done, int, str } from "../_ui";

const linkOk = (raw: string) => !raw || safeLink(raw) !== "";

export async function addSlides(f: FormData) {
  const u = await requirePerm("home", "create");
  const files = f.getAll("images").filter((x): x is File => x instanceof File && x.size > 0);
  if (!files.length) done("/admin/home", { error: "ยังไม่ได้เลือกภาพ" });
  const link = str(f, "linkUrl");
  if (!linkOk(link)) done("/admin/home", { error: "ลิงก์ต้องขึ้นต้นด้วย / (หน้าในเว็บ) หรือ https://" });
  const last = await prisma.homeSlide.aggregate({ _max: { sort: true } });
  let sort = (last._max.sort ?? 0) + 1;
  const bad: string[] = [];
  for (const img of files) {
    try {
      const key = await saveUpload(img, "public/home");
      await prisma.homeSlide.create({ data: { imageKey: key, title: files.length === 1 ? str(f, "title") : "", caption: files.length === 1 ? str(f, "caption") : "", linkUrl: link, sort: sort++ } });
    } catch (e) { bad.push(`${img.name}: ${e instanceof UploadError ? e.message : "อัปโหลดไม่สำเร็จ"}`); }
  }
  await logActivity(u.id, "create", "homeSlide", null, `${files.length - bad.length} ภาพ`);
  done("/admin/home", bad.length ? { error: `เพิ่ม ${files.length - bad.length} ภาพ ไม่สำเร็จ ${bad.length} ภาพ — ${bad.join(" · ")}` } : { ok: `เพิ่ม ${files.length} ภาพแล้ว` });
}

export async function saveSlide(f: FormData) {
  const u = await requirePerm("home", "edit");
  const link = str(f, "linkUrl");
  if (!linkOk(link)) done("/admin/home", { error: "ลิงก์ต้องขึ้นต้นด้วย / (หน้าในเว็บ) หรือ https://" });
  const s = await prisma.homeSlide.update({
    where: { id: str(f, "id") },
    data: { title: str(f, "title"), caption: str(f, "caption"), linkUrl: link, sort: int(f, "sort"), active: bool(f, "active") },
  }).catch(() => null);
  if (s) await logActivity(u.id, "update", "homeSlide", s.id, s.title);
  done("/admin/home", s ? { ok: "บันทึกแล้ว" } : { error: "ไม่พบภาพนี้" });
}

export async function deleteSlide(f: FormData) {
  const u = await requirePerm("home", "delete");
  const s = await prisma.homeSlide.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (s) { await removeUpload(s.imageKey); await logActivity(u.id, "delete", "homeSlide", s.id, s.title); }
  done("/admin/home", { ok: "ลบภาพแล้ว" });
}
