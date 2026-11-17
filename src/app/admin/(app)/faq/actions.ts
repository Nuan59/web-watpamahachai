"use server";
import { prisma } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { done, int, str } from "../_ui";

export async function saveFaq(f: FormData) {
  const id = str(f, "id");
  const u = await requirePerm("faq", id ? "edit" : "create");
  const data = { category: str(f, "category") || "ทั่วไป", question: str(f, "question"), answer: str(f, "answer"), sort: int(f, "sort") };
  if (!data.question || !data.answer) done("/admin/faq", { error: "กรอกคำถามและคำตอบให้ครบ" });
  const q = id ? await prisma.faq.update({ where: { id }, data }) : await prisma.faq.create({ data });
  await logActivity(u.id, id ? "update" : "create", "faq", q.id, q.question);
  done("/admin/faq", { ok: "บันทึกแล้ว" });
}

export async function deleteFaq(f: FormData) {
  const u = await requirePerm("faq", "delete");
  const q = await prisma.faq.delete({ where: { id: str(f, "id") } }).catch(() => null);
  if (q) await logActivity(u.id, "delete", "faq", q.id, q.question);
  done("/admin/faq", { ok: "ลบแล้ว" });
}
