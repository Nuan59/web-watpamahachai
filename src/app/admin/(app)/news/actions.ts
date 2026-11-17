"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { plainExcerpt, slugify } from "@/lib/text";
import type { SaveResult } from "@/components/form";
import { done, file, str } from "../_ui";

export async function savePost(f: FormData): Promise<SaveResult> {
  const id = str(f, "id");
  const u = await requirePerm("news", id ? "edit" : "create");
  const title = str(f, "title");
  if (!title) return { error: "ใส่หัวข้อข่าวก่อน" };
  const slug = slugify(str(f, "slug") || title);
  const clash = await prisma.post.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) return { error: `ลิงก์ /news/${slug} ใช้กับข่าว “${clash.title}” แล้ว เปลี่ยนลิงก์ของข่าวนี้` };
  const existing = id ? await prisma.post.findUnique({ where: { id } }) : null;
  if (id && !existing) done("/admin/news", { error: "ไม่พบข่าวนี้" });
  const status = str(f, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  let coverKey = existing?.coverKey ?? null;
  const cover = file(f, "cover");
  if (cover) {
    try { coverKey = await saveUpload(cover, "public/news"); } catch (e) { return { error: e instanceof UploadError ? e.message : "อัปโหลดรูปไม่สำเร็จ" }; }
    await removeUpload(existing?.coverKey);
  } else if (f.get("removeCover") === "1") { await removeUpload(coverKey); coverKey = null; }
  const body = String(f.get("body") ?? "");
  const data = {
    title, slug, body, coverKey, status,
    excerpt: str(f, "excerpt") || plainExcerpt(body, 180),
    publishedAt: status === "PUBLISHED" ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
  };
  const p = id ? await prisma.post.update({ where: { id }, data }) : await prisma.post.create({ data: { ...data, authorId: u.id } });
  await logActivity(u.id, id ? "update" : "create", "post", p.id, `${p.title} (${status === "PUBLISHED" ? "เผยแพร่" : "ร่าง"})`);
  done(`/admin/news/${p.id}`, { ok: status === "PUBLISHED" ? "บันทึกและเผยแพร่แล้ว" : "บันทึกฉบับร่างแล้ว" });
}

export async function deletePost(f: FormData) {
  const u = await requirePerm("news", "delete");
  const p = await prisma.post.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (p) { await removeUpload(p.coverKey); await logActivity(u.id, "delete", "post", p.id, p.title); }
  done("/admin/news", { ok: "ลบข่าวแล้ว" });
}
