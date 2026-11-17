"use server";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getSettings, saveSettings, SETTING_KEYS, type Settings } from "@/lib/settings";
import { removeUpload, saveUpload, UploadError } from "@/lib/storage";
import { bool, done, file, str } from "../_ui";

const IMAGES = ["abbotPhoto", "donateQr"] as const;

export async function saveTempleSettings(f: FormData) {
  const u = await requirePerm("settings", "edit");
  const cur = await getSettings();
  const next: Partial<Settings> = {};
  for (const k of SETTING_KEYS) if (!(IMAGES as readonly string[]).includes(k) && f.has(k)) next[k] = k === "history" ? String(f.get(k) ?? "").trim() : str(f, k);
  for (const k of ["libraryUrl", "facebook"] as const) if (next[k] && !/^https:\/\//.test(next[k]!)) done("/admin/settings", { error: "ลิงก์ Facebook และห้องสมุดต้องขึ้นต้นด้วย https://" });
  for (const k of IMAGES) {
    const up = file(f, k);
    if (up) {
      try { next[k] = await saveUpload(up, "public/site"); } catch (e) { done("/admin/settings", { error: e instanceof UploadError ? e.message : "อัปโหลดรูปไม่สำเร็จ" }); }
      await removeUpload(cur[k]);
    } else if (bool(f, `remove_${k}`)) { await removeUpload(cur[k]); next[k] = ""; }
  }
  await saveSettings(next);
  await logActivity(u.id, "update", "settings", null, Object.keys(next).filter((k) => next[k as keyof Settings] !== cur[k as keyof Settings]).join(", "));
  done("/admin/settings", { ok: "บันทึกข้อมูลวัดแล้ว" });
}
