"use server";
import { requirePerm } from "@/lib/auth";
import { saveUpload, UploadError } from "@/lib/storage";
import type { Module } from "@/lib/permissions";

const ALLOWED: Module[] = ["news", "events", "pages"];

/** Picture inserted into a news/event/page body from the editor. Returns its public URL. */
export async function uploadContentImage(module: string, f: FormData): Promise<{ url?: string; error?: string }> {
  await requirePerm(ALLOWED.includes(module as Module) ? (module as Module) : "pages", "create");
  const img = f.get("file");
  if (!(img instanceof File) || img.size === 0) return { error: "ยังไม่ได้เลือกรูป" };
  try {
    return { url: `/files/${await saveUpload(img, "public/content")}` };
  } catch (e) {
    return { error: e instanceof UploadError ? e.message : "อัปโหลดรูปไม่สำเร็จ" };
  }
}
