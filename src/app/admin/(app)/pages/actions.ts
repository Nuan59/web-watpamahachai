"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/text";
import { NAV_GROUPS } from "@/lib/nav";
import type { SaveResult } from "@/components/form";
import { bool, done, int, str } from "../_ui";

export async function savePage(f: FormData): Promise<SaveResult> {
  const id = str(f, "id");
  const u = await requirePerm("pages", id ? "edit" : "create");
  const title = str(f, "title");
  if (!title) return { error: "ใส่ชื่อหน้าก่อน" };
  const slug = slugify(str(f, "slug") || title);
  const clash = await prisma.page.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) return { error: `ลิงก์ /p/${slug} ใช้กับหน้า “${clash.title}” แล้ว` };
  const group = str(f, "navGroup");
  const data = { title, slug, body: String(f.get("body") ?? ""), navGroup: (NAV_GROUPS as readonly string[]).includes(group) ? group : "", published: bool(f, "published"), sort: int(f, "sort") };
  const p = id ? await prisma.page.update({ where: { id }, data }) : await prisma.page.create({ data });
  await logActivity(u.id, id ? "update" : "create", "page", p.id, p.title);
  done(`/admin/pages/${p.id}`, { ok: "บันทึกหน้าแล้ว" });
}

export async function deletePage(f: FormData) {
  const u = await requirePerm("pages", "delete");
  const p = await prisma.page.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (p) await logActivity(u.id, "delete", "page", p.id, p.title);
  done("/admin/pages", { ok: "ลบหน้าแล้ว" });
}
