import Image from "next/image";
import { isoDay } from "@/lib/dates";
import { EVENT_KIND } from "@/lib/labels";
import { fileUrl } from "@/lib/storage";
import { MdEditor } from "@/components/md-editor";
import { ActionForm, Submit } from "@/components/form";
import { Check, Field, Panel } from "../_ui";
import { saveEvent } from "./actions";

type Ev = { id: string; title: string; slug: string; kind: string; startDate: Date; endDate: Date; timeText: string; location: string; summary: string; body: string; coverKey: string | null; published: boolean; signupOpen: boolean; capacity: number | null };

export function EventForm({ e }: { e?: Ev }) {
  const cover = fileUrl(e?.coverKey);
  return (
    <ActionForm action={saveEvent} className="grid gap-5 xl:grid-cols-[1fr_320px]">
      {e && <input type="hidden" name="id" value={e.id} />}
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อกิจกรรม" className="sm:col-span-2"><input name="title" required defaultValue={e?.title} className="input text-lg" /></Field>
          <Field label="ประเภท"><select name="kind" defaultValue={e?.kind ?? "CEREMONY"} className="input">{Object.entries(EVENT_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
          <Field label="เวลา" hint="เช่น เริ่ม 08:00 น. หรือ 18:00–21:00 น."><input name="timeText" defaultValue={e?.timeText} className="input" /></Field>
          <Field label="วันเริ่ม"><input name="startDate" type="date" required defaultValue={e ? isoDay(e.startDate) : undefined} className="input" /></Field>
          <Field label="วันสิ้นสุด" hint="กิจกรรมวันเดียว เว้นว่างได้"><input name="endDate" type="date" defaultValue={e ? isoDay(e.endDate) : undefined} className="input" /></Field>
          <Field label="สถานที่" hint="เว้นว่าง = ที่วัด" className="sm:col-span-2"><input name="location" defaultValue={e?.location} className="input" /></Field>
          <Field label="สรุปสั้น ๆ" className="sm:col-span-2"><textarea name="summary" rows={2} defaultValue={e?.summary} className="input" /></Field>
          <div className="sm:col-span-2"><MdEditor name="body" defaultValue={e?.body} label="รายละเอียด / กำหนดการ" /></div>
        </div>
      </Panel>
      <div className="space-y-5">
        <Panel title="การแสดงผล">
          <div className="space-y-1">
            <Check name="published" label="แสดงบนเว็บไซต์" defaultChecked={e?.published ?? true} />
            <Check name="signupOpen" label="เปิดลงทะเบียนออนไลน์" defaultChecked={e?.signupOpen ?? false} />
            <Field label="รับจำนวน (คน)" hint="เว้นว่าง = ไม่จำกัด"><input name="capacity" type="number" min={1} defaultValue={e?.capacity ?? undefined} className="input" /></Field>
            <Field label="ลิงก์" hint="เว้นว่างได้ ระบบตั้งจากชื่อ"><input name="slug" defaultValue={e?.slug} className="input" /></Field>
            <div className="pt-2"><Submit className="btn btn-primary w-full">บันทึก</Submit></div>
          </div>
        </Panel>
        <Panel title="รูปประกอบ">
          {cover && <Image src={cover} alt="" width={320} height={180} className="mb-3 aspect-video w-full rounded-md object-cover" />}
          <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
          {cover && <div className="mt-2"><Check name="removeCover" label="ลบรูป" /></div>}
        </Panel>
      </div>
    </ActionForm>
  );
}
