import { NAV_GROUPS } from "@/lib/nav";
import { MdEditor } from "@/components/md-editor";
import { ActionForm, Submit } from "@/components/form";
import { Check, Field, Panel } from "../_ui";
import { savePage } from "./actions";

type Pg = { id: string; title: string; slug: string; body: string; navGroup: string; published: boolean; sort: number };

export function PageForm({ p }: { p?: Pg }) {
  return (
    <ActionForm action={savePage} className="grid gap-5 xl:grid-cols-[1fr_300px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Panel>
        <div className="space-y-4">
          <Field label="ชื่อหน้า"><input name="title" required defaultValue={p?.title} className="input text-lg" /></Field>
          <MdEditor name="body" defaultValue={p?.body} rows={20} imagesFor="pages" />
        </div>
      </Panel>
      <Panel title="การแสดงผล">
        <div className="space-y-3">
          <Field label="อยู่ในเมนู" hint="เลือก “ไม่อยู่ในเมนู” แล้วนำลิงก์ไปใส่ในหน้าอื่นได้">
            <select name="navGroup" defaultValue={p?.navGroup ?? ""} className="input"><option value="">ไม่อยู่ในเมนู</option>{NAV_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}</select>
          </Field>
          <Field label="ลำดับในเมนู"><input name="sort" type="number" defaultValue={p?.sort ?? 0} className="input" /></Field>
          <Field label="ลิงก์" hint="เว้นว่างได้ ระบบตั้งจากชื่อ"><input name="slug" defaultValue={p?.slug} className="input" /></Field>
          <Check name="published" label="แสดงบนเว็บไซต์" defaultChecked={p?.published ?? true} />
          <Submit className="btn btn-primary w-full">บันทึก</Submit>
        </div>
      </Panel>
    </ActionForm>
  );
}
