import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Field, Flash, Head, Panel, type SP } from "../_ui";
import { deleteFaq, saveFaq } from "./actions";

export const metadata = { title: "คำถามที่พบบ่อย" };

function Fields({ q }: { q?: { category: string; question: string; answer: string; sort: number } }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
      <Field label="คำถาม"><input name="question" required defaultValue={q?.question} className="input" /></Field>
      <Field label="ลำดับ"><input name="sort" type="number" defaultValue={q?.sort ?? 0} className="input" /></Field>
      <Field label="คำตอบ" className="sm:col-span-2"><textarea name="answer" required rows={3} defaultValue={q?.answer} className="input" /></Field>
      <Field label="หมวด"><input name="category" list="faq-cats" defaultValue={q?.category ?? "ทั่วไป"} className="input" /></Field>
    </div>
  );
}

export default async function FaqAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("faq");
  const faqs = await prisma.faq.findMany({ orderBy: [{ category: "asc" }, { sort: "asc" }] });
  return (
    <>
      <Head title="คำถามที่พบบ่อย" />
      <Flash sp={await searchParams} />
      <datalist id="faq-cats">{[...new Set(["ทั่วไป", ...faqs.map((f) => f.category)])].map((c) => <option key={c} value={c} />)}</datalist>
      {can(u, "faq", "create") && <Panel title="เพิ่มคำถาม" className="mb-5"><form action={saveFaq} className="space-y-3"><Fields /><Submit>เพิ่มคำถาม</Submit></form></Panel>}
      <div className="space-y-3">
        {faqs.map((q) => (
          <details key={q.id} className="rounded-lg border border-line bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3"><span className="font-medium">{q.question}</span><span className="text-sm text-muted">{q.category}</span></summary>
            <div className="border-t border-line p-4">
              {can(u, "faq", "edit") ? <form action={saveFaq} className="space-y-3"><input type="hidden" name="id" value={q.id} /><Fields q={q} /><Submit>บันทึก</Submit></form> : <p className="whitespace-pre-line text-muted">{q.answer}</p>}
              {can(u, "faq", "delete") && <form action={deleteFaq} className="mt-3"><input type="hidden" name="id" value={q.id} /><ConfirmSubmit message="ลบคำถามนี้?">ลบ</ConfirmSubmit></form>}
            </div>
          </details>
        ))}
        {!faqs.length && <p className="text-muted">ยังไม่มีคำถาม</p>}
      </div>
    </>
  );
}
