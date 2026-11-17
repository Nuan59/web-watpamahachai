import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { thDate } from "@/lib/dates";
import { audioSrc } from "@/lib/text";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Check, Field, Flash, Head, Panel, Pill, type SP } from "../_ui";
import { addQuote, deleteQuote, deleteTrack, saveTrack } from "./actions";

export const metadata = { title: "เสียงธรรมและโอวาท" };

function TrackFields({ t }: { t?: { title: string; speaker: string; category: string; url: string; featured: boolean; sort: number; fileKey: string | null } }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="ชื่อเรื่อง" className="sm:col-span-2"><input name="title" required defaultValue={t?.title} className="input" /></Field>
      <Field label="ผู้แสดงธรรม"><input name="speaker" defaultValue={t?.speaker} className="input" /></Field>
      <Field label="หมวด" hint="เช่น ธรรมบรรยาย, บทสวดมนต์, นำนั่งสมาธิ"><input name="category" list="audio-cats" defaultValue={t?.category ?? "ธรรมบรรยาย"} className="input" /></Field>
      <Field label={t?.fileKey ? "เปลี่ยนไฟล์เสียง" : "ไฟล์เสียง"} hint="MP3/M4A ไม่เกิน 80 MB"><input name="file" type="file" accept="audio/*" className="block w-full text-sm" /></Field>
      <Field label="หรือ ลิงก์ Google Drive / ลิงก์ไฟล์เสียง" hint="ไฟล์ใน Drive ต้องแชร์แบบ “ทุกคนที่มีลิงก์”"><input name="url" defaultValue={t?.url} className="input" /></Field>
      <Field label="ลำดับ" hint="เลขน้อยขึ้นก่อน"><input name="sort" type="number" defaultValue={t?.sort ?? 0} className="input" /></Field>
      <div className="self-end"><Check name="featured" label="ให้เล่นเป็นเรื่องแรก (เรื่องเด่น)" defaultChecked={t?.featured} /></div>
    </div>
  );
}

export default async function DhammaAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("dhamma");
  const sp = await searchParams;
  const [tracks, quotes] = await Promise.all([
    prisma.audioTrack.findMany({ orderBy: [{ featured: "desc" }, { sort: "asc" }, { createdAt: "desc" }] }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const cats = [...new Set(["ธรรมบรรยาย", "บทสวดมนต์", "นำนั่งสมาธิ", ...tracks.map((t) => t.category)])];
  return (
    <>
      <Head title="เสียงธรรมและโอวาท" />
      <Flash sp={sp} />
      <datalist id="audio-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
      <div className="grid gap-5 2xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {can(u, "dhamma", "create") && (
            <Panel title="เพิ่มเสียงธรรม">
              <form action={saveTrack} className="space-y-3"><TrackFields /><Submit pendingText="กำลังอัปโหลด…">เพิ่มเสียงธรรม</Submit></form>
            </Panel>
          )}
          <Panel title={`เสียงธรรมทั้งหมด (${tracks.length})`}>
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
                            <form action={saveTrack} className="mt-3 space-y-3"><input type="hidden" name="id" value={t.id} /><TrackFields t={t} /><Submit>บันทึก</Submit></form>
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
