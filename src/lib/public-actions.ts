"use server";
import { headers } from "next/headers";
import { prisma } from "./db";
import { signUp } from "./events";
import { allow } from "./ratelimit";
import { TOPIC } from "./labels";

export type FormState = { ok?: boolean; error?: string; values?: Record<string, string> } | undefined;

/** React resets a form after its action runs; hand the typed values back so an error doesn't wipe them. */
const keep = (f: FormData, error: string): FormState => ({
  error,
  values: Object.fromEntries([...f.entries()].filter(([k, v]) => typeof v === "string" && k !== "website" && !k.startsWith("$")) as [string, string][]),
});

const ERR: Record<string, string> = {
  REQUIRED: "กรอกชื่อและเบอร์โทรให้ครบ",
  BAD_PHONE: "เบอร์โทรไม่ถูกต้อง ใส่เบอร์ ๙–๑๐ หลัก เช่น 081-234-5678",
  BAD_PEOPLE: "จำนวนคนต้องอยู่ระหว่าง ๑–๒๐ คน",
  CLOSED: "กิจกรรมนี้ปิดรับลงทะเบียนแล้ว สอบถามทางวัดได้โดยตรง",
  FULL: "ที่ว่างไม่พอสำหรับจำนวนคนนี้ ลองลดจำนวนคน หรือสอบถามทางวัด",
  PAST: "กิจกรรมนี้ผ่านไปแล้ว",
  NOT_FOUND: "ไม่พบกิจกรรมนี้",
  RATE: "ส่งบ่อยเกินไป รอสักครู่แล้วลองใหม่",
};

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function registerForEvent(_: FormState, f: FormData): Promise<FormState> {
  if (s(f, "website")) return { ok: true }; // honeypot: bots fill every field
  if (!allow(`reg:${await ip()}`, 8, 10 * 60_000)) return keep(f, ERR.RATE);
  const r = await signUp({
    eventId: s(f, "eventId"), name: s(f, "name"), phone: s(f, "phone"),
    age: parseInt(s(f, "age"), 10) || undefined, gender: s(f, "gender"), people: parseInt(s(f, "people") || "1", 10), note: s(f, "note"),
  });
  return r.ok ? { ok: true } : keep(f, ERR[r.error]);
}

export async function sendMessage(_: FormState, f: FormData): Promise<FormState> {
  if (s(f, "website")) return { ok: true };
  const name = s(f, "name"), contact = s(f, "contact"), body = s(f, "body");
  if (!name || !contact || !body) return keep(f, "กรอกชื่อ ช่องทางติดต่อกลับ และข้อความให้ครบ");
  if (body.length > 3000) return keep(f, "ข้อความยาวเกินไป (ไม่เกิน ๓,๐๐๐ ตัวอักษร)");
  if (!allow(`msg:${await ip()}`, 5, 10 * 60_000)) return keep(f, ERR.RATE);
  const topic = s(f, "topic") in TOPIC ? s(f, "topic") : "GENERAL";
  await prisma.message.create({ data: { name: name.slice(0, 120), contact: contact.slice(0, 200), topic, body } });
  return { ok: true };
}
