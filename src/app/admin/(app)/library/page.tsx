import Image from "next/image";
import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Check, Field, Flash, Head, Panel, Pill, type SP } from "../_ui";
import { addDocs, deleteDoc, saveDoc } from "./actions";

export const metadata = { title: "ห้องสมุดหนังสือ" };

export default async function LibraryAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("library");
  const docs = await prisma.libraryDoc.findMany({ orderBy: [{ category: "asc" }, { sort: "asc" }] });
  const cats = [...new Set(["หนังสือสวดมนต์", "เรียนนักธรรมและบาลี", ...docs.map((d) => d.category)])];
  const used = [...new Set(docs.map((d) => d.category))];
  return (
    <>
      <Head title="ห้องสมุดหนังสือ" actions={<Link href="/library" target="_blank" className="btn btn-sm">ดูบนเว็บ ↗</Link>} />
      <Flash sp={await searchParams} />
      <p className="mb-4 hint">ไฟล์ PDF ให้อ่านบนเว็บและดาวน์โหลดได้ ส่วนไฟล์ ZIP (เช่น โปรแกรมสอนบาลี) ให้ดาวน์โหลด แต่ละหมวดขึ้นเป็นเมนูย่อยใต้ “ห้องสมุด”</p>
      <datalist id="doc-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
      {can(u, "library", "create") && (
        <Panel title="เพิ่มหนังสือ / ไฟล์" className="mb-5">
          <form action={addDocs} className="grid gap-3 lg:grid-cols-2">
            <Field label="หมวด"><input name="category" list="doc-cats" required defaultValue="หนังสือสวดมนต์" className="input" /></Field>
            <Field label="ไฟล์ PDF / ZIP (เลือกได้หลายไฟล์)" hint="ไฟล์ละไม่เกิน 95 MB ชื่อหนังสือตั้งจากชื่อไฟล์"><input name="files" type="file" multiple accept=".pdf,.zip,application/pdf,application/zip" className="block w-full text-sm" /></Field>
            <Field label="ชื่อหนังสือ" hint="ใช้เมื่อเพิ่มทีละไฟล์ หรือเพิ่มด้วยลิงก์"><input name="title" className="input" /></Field>
            <Field label="หรือ ลิงก์ (ถ้าไฟล์อยู่ที่อื่น)" hint="เช่น Google Drive ขึ้นต้นด้วย https://"><input name="url" className="input" /></Field>
            <Field label="คำอธิบายสั้น ๆ" className="lg:col-span-2"><input name="summary" className="input" /></Field>
            <div><Submit pendingText="กำลังอัปโหลด…">เพิ่ม</Submit></div>
          </form>
        </Panel>
      )}
      {used.map((c) => (
        <Panel key={c} title={c} className="mb-5">
          <ul className="space-y-2">
            {docs.filter((d) => d.category === c).map((d) => (
              <li key={d.id} className="rounded-md border border-line p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a href={d.fileKey ? fileUrl(d.fileKey)! : d.url} target="_blank" rel="noopener" className="font-medium underline-offset-2 hover:underline">{d.title}</a>
                  <Pill>{d.fileKey ? (d.fileKey.endsWith(".zip") ? "ZIP" : "PDF") : "ลิงก์"}</Pill>
                </div>
                {can(u, "library", "edit") && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-sm text-brown underline">แก้ไข</summary>
                    <form action={saveDoc} className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={d.id} />
                      <Field label="ชื่อ"><input name="title" defaultValue={d.title} className="input" /></Field>
                      <Field label="หมวด"><input name="category" list="doc-cats" defaultValue={d.category} className="input" /></Field>
                      <Field label="คำอธิบาย" className="sm:col-span-2"><input name="summary" defaultValue={d.summary} className="input" /></Field>
                      <Field label="เปลี่ยนไฟล์"><input name="file" type="file" accept=".pdf,.zip" className="block w-full text-sm" /></Field>
                      <Field label="ลิงก์"><input name="url" defaultValue={d.url} className="input" /></Field>
                      <Field label="รูปปก">
                        {d.coverKey && <Image src={fileUrl(d.coverKey)!} alt="" width={60} height={84} className="mb-1 h-20 w-14 rounded object-cover" />}
                        <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
                        {d.coverKey && <Check name="removeCover" label="ลบรูปปก" />}
                      </Field>
                      <Field label="ลำดับ"><input name="sort" type="number" defaultValue={d.sort} className="input" /></Field>
                      <div><Submit pendingText="กำลังบันทึก…">บันทึก</Submit></div>
                    </form>
                  </details>
                )}
                {can(u, "library", "delete") && <form action={deleteDoc} className="mt-2"><input type="hidden" name="id" value={d.id} /><ConfirmSubmit message={`ลบ “${d.title}”?`}>ลบ</ConfirmSubmit></form>}
              </li>
            ))}
          </ul>
        </Panel>
      ))}
      {!docs.length && <p className="text-muted">ยังไม่มีหนังสือ</p>}
    </>
  );
}
