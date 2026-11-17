import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { thDate } from "@/lib/dates";
import { audioSrc } from "@/lib/text";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Field, Flash, Head, Panel, Pill, type SP } from "../_ui";
import Link from "next/link";
import { TrackFields } from "./track-fields";
import { addQuote, deleteQuote, deleteTrack, saveSeries, saveTrack } from "./actions";

export const metadata = { title: "เสียงธรรมและโอวาท" };


export default async function DhammaAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("dhamma");
  const sp = await searchParams;
  const [tracks, quotes, series] = await Promise.all([
    prisma.audioTrack.findMany({ where: { seriesId: null }, orderBy: [{ featured: "desc" }, { sort: "asc" }, { createdAt: "desc" }] }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.audioSeries.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "asc" }], include: { _count: { select: { tracks: true } } } }),
  ]);
  const cats = [...new Set(["ธรรมบรรยาย", "บทสวดมนต์", "นำนั่งสมาธิ", ...tracks.map((t) => t.category)])];
  return (
    <>
      <Head title="เสียงธรรมและโอวาท" />
      <Flash sp={sp} />
      <datalist id="audio-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
      <div className="grid gap-5 2xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Panel title={`ชุดเสียงธรรม (${series.length})`}>
            <p className="hint mb-3">แต่ละชุดขึ้นเป็นเมนูย่อยใต้ “เสียงธรรม” เหมือนเว็บเดิม เช่น ธรรมกำไรชีวิต ธรรมีกถาเย็น พระไตรปิฎก</p>
            {series.length > 0 && (
              <ul className="mb-4 divide-y divide-cream">
                {series.map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <Link href={`/admin/dhamma/${x.id}`} className="font-medium underline-offset-2 hover:underline">{x.title}</Link>
                    <span className="flex gap-1">{!x.published && <Pill>ซ่อน</Pill>}<Pill>{x._count.tracks} ไฟล์</Pill></span>
                  </li>
                ))}
              </ul>
            )}
            {can(u, "dhamma", "create") && (
              <form action={saveSeries} className="flex flex-wrap items-end gap-3">
                <Field label="สร้างชุดใหม่" className="min-w-60 flex-1"><input name="title" required placeholder="เช่น ธรรมกำไรชีวิต" className="input" /></Field>
                <Field label="ผู้บรรยาย" className="min-w-48 flex-1"><input name="speaker" className="input" /></Field>
                <Submit>สร้างชุด</Submit>
              </form>
            )}
          </Panel>
          {can(u, "dhamma", "create") && (
            <Panel title="เพิ่มเสียงธรรมทีละเรื่อง">
              <form action={saveTrack} className="space-y-3"><TrackFields series={series} /><Submit pendingText="กำลังอัปโหลด…">เพิ่มเสียงธรรม</Submit></form>
            </Panel>
          )}
          <Panel title={`เสียงธรรมที่ไม่อยู่ในชุด (${tracks.length})`}>
            {tracks.length ? (
              <ul className="space-y-3">
                {tracks.map((t) => {
                  const src = audioSrc(t);
                  return (
                    <li key={t.id} className="rounded-md border border-line p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{t.title} <span className="text-sm font-normal text-muted">· {t.category}{t.speaker && ` · ${t.speaker}`}</span></p>
                        <span className="flex gap-1">{t.featured && <Pill tone="brown">เรื่องเด่น</Pill>}<Pill>{t.fileKey ? "ไฟล์ในเว็บ" : "ลิงก์ภายนอก"}</Pill></span>
                      </div>
                      {src && <audio controls preload="none" src={src} className="mt-2 w-full" />}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {can(u, "dhamma", "edit") && (
                          <details className="w-full">
                            <summary className="cursor-pointer text-sm text-brown underline">แก้ไข</summary>
                            <form action={saveTrack} className="mt-3 space-y-3"><input type="hidden" name="id" value={t.id} /><TrackFields t={t} series={series} /><Submit>บันทึก</Submit></form>
                          </details>
                        )}
                        {can(u, "dhamma", "delete") && <form action={deleteTrack}><input type="hidden" name="id" value={t.id} /><ConfirmSubmit message={`ลบ “${t.title}”?`}>ลบ</ConfirmSubmit></form>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : <p className="text-muted">ยังไม่มีเสียงธรรม</p>}
          </Panel>
        </div>
        <div className="space-y-5">
          {can(u, "dhamma", "create") && (
            <Panel title="เพิ่มโอวาทธรรม">
              <form action={addQuote} className="space-y-3">
                <Field label="ข้อความ"><textarea name="text" required rows={3} className="input" /></Field>
                <Field label="ผู้ให้โอวาท"><input name="author" placeholder="โอวาทธรรม พระครูสิริสุตวราภรณ์" className="input" /></Field>
                <Submit>เพิ่มโอวาท</Submit>
              </form>
            </Panel>
          )}
          <Panel title="โอวาทธรรม" actions={<span className="hint">อันล่าสุดแสดงที่หน้าแรก</span>}>
            {quotes.length ? (
              <ul className="space-y-3">
                {quotes.map((q, i) => (
                  <li key={q.id} className="border-l-4 border-brown pl-3">
                    <p className="whitespace-pre-line font-display">“{q.text}”</p>
                    <p className="text-sm text-muted">— {q.author || "โอวาทธรรม"} · {thDate(q.createdAt)} {i === 0 && <Pill tone="brown">แสดงที่หน้าแรก</Pill>}</p>
                    {can(u, "dhamma", "delete") && <form action={deleteQuote} className="mt-1"><input type="hidden" name="id" value={q.id} /><ConfirmSubmit message="ลบโอวาทนี้?">ลบ</ConfirmSubmit></form>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted">ยังไม่มีโอวาท หน้าเว็บจะแสดงคติธรรมของวัดแทน</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
