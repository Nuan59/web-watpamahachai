import Image from "next/image";
import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Check, Field, Flash, Head, Panel, Pill, type SP } from "../_ui";
import { deleteMonk, saveMonk } from "./actions";

export const metadata = { title: "พระในสังกัด" };

type M = { name: string; title: string; position: string; born: string; ordained: string; education: string; note: string; sort: number; photoKey: string | null; published: boolean };

function Fields({ m }: { m?: M }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="ชื่อและฉายา"><input name="name" required defaultValue={m?.name} placeholder="พระมหาประกอบ ธมฺมชีโว" className="input" /></Field>
      <Field label="สมณศักดิ์ (ถ้ามี)"><input name="title" defaultValue={m?.title} placeholder="พระครู…" className="input" /></Field>
      <Field label="ตำแหน่ง"><input name="position" defaultValue={m?.position} placeholder="เจ้าอาวาส / รองเจ้าอาวาส" className="input" /></Field>
      <Field label="การศึกษา"><input name="education" defaultValue={m?.education} placeholder="นักธรรมชั้นเอก ป.ธ. ๕" className="input" /></Field>
      <Field label="เกิด"><input name="born" defaultValue={m?.born} placeholder="๑๖ กรกฎาคม พ.ศ. ๒๕๐๓" className="input" /></Field>
      <Field label="อุปสมบท"><input name="ordained" defaultValue={m?.ordained} placeholder="๕ กรกฎาคม พ.ศ. ๒๕๒๓" className="input" /></Field>
      <Field label="หมายเหตุ" className="sm:col-span-2"><textarea name="note" rows={2} defaultValue={m?.note} className="input" /></Field>
      <Field label="รูป">
        {m?.photoKey && <Image src={fileUrl(m.photoKey)!} alt="" width={80} height={100} className="mb-1 h-24 w-20 rounded object-cover" />}
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
        {m?.photoKey && <Check name="removePhoto" label="ลบรูป" />}
      </Field>
      <Field label="ลำดับ" hint="เลขน้อยขึ้นก่อน"><input name="sort" type="number" defaultValue={m?.sort ?? 0} className="input" /></Field>
      {m && <Check name="published" label="แสดงบนเว็บไซต์" defaultChecked={m.published} />}
    </div>
  );
}

export default async function MonksAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("monks");
  const monks = await prisma.monk.findMany({ orderBy: [{ sort: "asc" }, { name: "asc" }] });
  return (
    <>
      <Head title="พระในสังกัด" actions={<Link href="/monks" target="_blank" className="btn btn-sm">ดูบนเว็บ ↗</Link>} />
      <Flash sp={await searchParams} />
      <p className="mb-4 hint">เมื่อมีรายชื่ออย่างน้อย ๑ รูป เมนู “ประวัติ → พระในสังกัด” จะขึ้นบนเว็บ</p>
      {can(u, "monks", "create") && <Panel title="เพิ่มรายนาม" className="mb-5"><form action={saveMonk} className="space-y-3"><Fields /><Submit pendingText="กำลังบันทึก…">เพิ่ม</Submit></form></Panel>}
      <div className="grid gap-4 lg:grid-cols-2">
        {monks.map((m) => (
          <div key={m.id} className="rounded-lg border border-line bg-white p-4">
            <div className="flex gap-3">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-cream">{m.photoKey && <Image src={fileUrl(m.photoKey)!} alt="" fill sizes="80px" className="object-cover" />}</div>
              <div><p className="text-sm text-brown">{m.title}</p><p className="font-semibold">{m.name}</p><p className="text-sm text-muted">{m.position}</p>{!m.published && <Pill>ซ่อน</Pill>}</div>
            </div>
            {can(u, "monks", "edit") && (
              <details className="mt-2"><summary className="cursor-pointer text-sm text-brown underline">แก้ไข</summary>
                <form action={saveMonk} className="mt-3 space-y-3"><input type="hidden" name="id" value={m.id} /><Fields m={m} /><Submit pendingText="กำลังบันทึก…">บันทึก</Submit></form>
              </details>
            )}
            {can(u, "monks", "delete") && <form action={deleteMonk} className="mt-2"><input type="hidden" name="id" value={m.id} /><ConfirmSubmit message={`ลบ “${m.name}”?`}>ลบ</ConfirmSubmit></form>}
          </div>
        ))}
      </div>
      {!monks.length && <p className="text-muted">ยังไม่มีรายนาม</p>}
    </>
  );
}
