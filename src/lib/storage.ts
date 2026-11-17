// The only module that touches upload storage. Swap the bodies for S3/R2 later; keys stay the same.
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const root = () => path.resolve(process.env.UPLOAD_DIR ?? "uploads");
const IMAGE: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const AUDIO: Record<string, string> = { "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac", "audio/ogg": "ogg", "audio/wav": "wav", "audio/x-wav": "wav" };
const DOC: Record<string, string> = { "application/pdf": "pdf", "application/zip": "zip", "application/x-zip-compressed": "zip" };
const DOC_EXT: Record<string, string> = { pdf: "pdf", zip: "zip" };
export const MAX_DOC = 95 * 1024 * 1024;
export const MAX_IMAGE = 10 * 1024 * 1024;
export const MAX_AUDIO = 80 * 1024 * 1024;
export const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg", png: "image/png", webp: "image/webp", mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", wav: "audio/wav", pdf: "application/pdf", zip: "application/zip",
};

export function keyToPath(key: string) {
  const r = root();
  const p = path.resolve(r, key);
  if (path.isAbsolute(key) || !p.startsWith(r + path.sep)) throw new Error("Bad storage key");
  return p;
}

export class UploadError extends Error {}

export async function saveUpload(file: File, folder: string, kind: "image" | "audio" | "doc" = "image") {
  const types = kind === "image" ? IMAGE : kind === "audio" ? AUDIO : DOC;
  const byName = file.name.split(".").pop()?.toLowerCase() ?? "";
  const ext = types[file.type] ?? (kind === "audio" ? AUDIO_EXT[byName] : kind === "doc" ? DOC_EXT[byName] : undefined);
  if (!ext) throw new UploadError({ image: "รองรับเฉพาะรูป JPG, PNG หรือ WEBP", audio: "รองรับเฉพาะไฟล์เสียง MP3, M4A, AAC, OGG หรือ WAV", doc: "รองรับเฉพาะไฟล์ PDF หรือ ZIP" }[kind]);
  const max = { image: MAX_IMAGE, audio: MAX_AUDIO, doc: MAX_DOC }[kind];
  if (file.size > max) throw new UploadError(`ไฟล์ใหญ่เกิน ${max / 1024 / 1024} MB`);
  const key = `${folder}/${randomUUID()}.${ext}`;
  const p = keyToPath(key);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, Buffer.from(await file.arrayBuffer()));
  return key;
}
const AUDIO_EXT: Record<string, string> = { mp3: "mp3", m4a: "m4a", aac: "aac", ogg: "ogg", wav: "wav" };

export async function readUpload(key: string) {
  try {
    return await readFile(keyToPath(key));
  } catch {
    return null;
  }
}

export async function removeUpload(key: string | null | undefined) {
  if (!key) return;
  await unlink(keyToPath(key)).catch(() => {});
}

export const fileUrl = (key: string | null | undefined) => (key ? `/files/${key}` : null);
