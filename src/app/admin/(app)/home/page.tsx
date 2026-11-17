import Image from "next/image";
import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Check, Field, Flash, Head, Panel, Pill, type SP } from "../_ui";
import { addSlides, deleteSlide, saveSlide } from "./actions";

export const metadata = { title: "ภาพหน้าแรก" };

export default async function HomeSlidesAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("home");
  const slides = await prisma.homeSlide.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  const edit = can(u, "home", "edit");
  return (
    <>
      <Head title="ภาพหน้าแรก" actions={<Link href="/" target="_blank" className="btn btn-sm">ดูหน้าแรก ↗</Link>} />
      <Flash sp={await searchParams} />
      <p className="mb-4 hint">ภาพเหล่านี้หมุนเปลี่ยนเป็นสไลด์ด้านบนสุดของหน้าแรก ทุก ๖ วินาที ใช้ภาพแนวนอนจะสวยที่สุด (กว้างอย่างน้อย 1600 พิกเซล) ถ้าไม่มีภาพที่เปิดแสดง หน้าแรกจะเริ่มที่โลโก้และคติธรรมแทน</p>
      {can(u, "home", "create") && (
        <Panel title="เพิ่มภาพ" className="mb-5">
          <form action={addSlides} className="grid gap-3 lg:grid-cols-2">
            <Field label="เลือกภาพ (เลือกได้หลายภาพ)" hint="JPG, PNG หรือ WEBP ภาพละไม่เกิน 10 MB"><input name="images" type="file" multiple required accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" /></Field>
            <Field label="ลิงก์เมื่อกดที่ภาพ (ถ้ามี)" hint="เช่น /events หรือ https://www.facebook.com/…"><input name="linkUrl" className="input" /></Field>
            <Field label="หัวข้อบนภาพ (ถ้ามี)" hint="ใช้เมื่อเพิ่มทีละภาพ"><input name="title" className="input" /></Field>
            <Field label="คำบรรยายบนภาพ (ถ้ามี)"><input name="caption" className="input" /></Field>
            <div><Submit pendingText="กำลังอัปโหลด…">เพิ่มภาพ</Submit></div>
          </form>
        </Panel>
      )}
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {slides.map((s, k) => (
          <div key={s.id} className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="relative aspect-[16/8] bg-cream">
              <Image src={fileUrl(s.imageKey)!} alt={s.title} fill sizes="(min-width:1536px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover" />
              <span className="absolute left-2 top-2 flex gap-1"><Pill tone="brown">ลำดับ {k + 1}</Pill>{!s.active && <Pill>ซ่อนอยู่</Pill>}</span>
            </div>
            <div className="p-3">
              {edit ? (
                <form action={saveSlide} className="space-y-2">
                  <input type="hidden" name="id" value={s.id} />
                  <input name="title" defaultValue={s.title} placeholder="หัวข้อบนภาพ" aria-label="หัวข้อบนภาพ" className="input" />
                  <input name="caption" defaultValue={s.caption} placeholder="คำบรรยาย" aria-label="คำบรรยาย" className="input" />
                  <input name="linkUrl" defaultValue={s.linkUrl} placeholder="ลิงก์ เช่น /events" aria-label="ลิงก์" className="input" />
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">ลำดับ<input name="sort" type="number" defaultValue={s.sort} className="input w-20" /></label>
                    <Check name="active" label="แสดงบนหน้าแรก" defaultChecked={s.active} />
                  </div>
                  <Submit className="btn">บันทึก</Submit>
                </form>
              ) : (
                <p className="text-sm">{s.title || "—"}<span className="block text-muted">{s.caption}</span></p>
              )}
              {can(u, "home", "delete") && <form action={deleteSlide} className="mt-2"><input type="hidden" name="id" value={s.id} /><ConfirmSubmit message="ลบภาพนี้ออกจากหน้าแรก?">ลบภาพ</ConfirmSubmit></form>}
            </div>
          </div>
        ))}
      </div>
      {!slides.length && <p className="text-muted">ยังไม่มีภาพหน้าแรก</p>}
    </>
  );
}
