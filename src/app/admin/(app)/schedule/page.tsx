import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Flash, Head, Panel, type SP } from "../_ui";
import { deleteItem, saveItem } from "./actions";

export const metadata = { title: "ตารางกิจวัตร" };

export default async function ScheduleAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("schedule");
  const items = await prisma.scheduleItem.findMany({ orderBy: [{ category: "asc" }, { sort: "asc" }, { time: "asc" }] });
  const cats = [...new Set(items.map((i) => i.category))];
  const edit = can(u, "schedule", "edit"), del = can(u, "schedule", "delete");
  return (
    <>
      <Head title="ตารางกิจวัตร" />
      <Flash sp={await searchParams} />
      <p className="mb-4 hint">แต่ละหมวดแสดงเป็นกล่องในหน้า “ตารางกิจวัตร” เรียงตามลำดับ (เลขน้อยขึ้นก่อน) แล้วตามเวลา</p>
      <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
      {can(u, "schedule", "create") && (
        <Panel title="เพิ่มรายการ" className="mb-5">
          <form action={saveItem} className="grid gap-3 sm:grid-cols-[1fr_8rem_2fr_5rem_auto] sm:items-end">
            <label><span className="label">หมวด</span><input name="category" list="cats" required placeholder="กิจวัตรประจำวัน" className="input" /></label>
            <label><span className="label">เวลา</span><input name="time" required placeholder="04:00 น." className="input" /></label>
            <label><span className="label">กิจกรรม</span><input name="title" required className="input" /></label>
            <label><span className="label">ลำดับ</span><input name="sort" type="number" defaultValue={0} className="input" /></label>
            <Submit>เพิ่ม</Submit>
          </form>
        </Panel>
      )}
      <div className="space-y-5">
        {cats.map((c) => (
          <Panel key={c} title={c}>
            <ul className="space-y-2">
              {items.filter((i) => i.category === c).map((i) => (
                <li key={i.id} className="flex flex-wrap items-end gap-2 border-b border-cream pb-2">
                  <form action={saveItem} className="grid flex-1 gap-2 sm:grid-cols-[10rem_8rem_2fr_5rem_auto]">
                    <input type="hidden" name="id" value={i.id} />
                    <input name="category" list="cats" defaultValue={i.category} aria-label="หมวด" className="input" disabled={!edit} />
                    <input name="time" defaultValue={i.time} aria-label="เวลา" className="input" disabled={!edit} />
                    <input name="title" defaultValue={i.title} aria-label="กิจกรรม" className="input" disabled={!edit} />
                    <input name="sort" type="number" defaultValue={i.sort} aria-label="ลำดับ" className="input" disabled={!edit} />
                    {edit && <Submit className="btn">บันทึก</Submit>}
                  </form>
                  {del && <form action={deleteItem}><input type="hidden" name="id" value={i.id} /><ConfirmSubmit message={`ลบ “${i.time} ${i.title}”?`}>ลบ</ConfirmSubmit></form>}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
        {!cats.length && <p className="text-muted">ยังไม่มีรายการ</p>}
      </div>
    </>
  );
}
