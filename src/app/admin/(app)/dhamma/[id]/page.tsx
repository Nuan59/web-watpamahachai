import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { audioSrc } from "@/lib/text";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Check, Field, Flash, Head, Panel, Pill, type SP } from "../../_ui";
import { addSeriesTracks, deleteSeries, deleteTrack, saveSeries, saveTrack } from "../actions";
import { TrackFields } from "../track-fields";

export const metadata = { title: "ชุดเสียงธรรม" };

export default async function SeriesAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const u = await requirePerm("dhamma");
  const x = await prisma.audioSeries.findUnique({ where: { id: (await params).id }, include: { tracks: { orderBy: [{ sort: "asc" }, { createdAt: "asc" }] } } });
  if (!x) notFound();
  const all = await prisma.audioSeries.findMany({ orderBy: { sort: "asc" }, select: { id: true, title: true } });
  const back = `/admin/dhamma/${x.id}`;
  const edit = can(u, "dhamma", "edit");
  return (
    <>
      <Head title={x.title} crumbs={[["เสียงธรรมและโอวาท", "/admin/dhamma"], [x.title]]} actions={x.published && <Link href={`/dhamma/${x.slug}`} target="_blank" className="btn btn-sm">ดูบนเว็บ ↗</Link>} />
      <Flash sp={await searchParams} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {can(u, "dhamma", "create") && (
            <Panel title="เพิ่มไฟล์เสียงเข้าชุดนี้">
              <form action={addSeriesTracks} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="seriesId" value={x.id} />
                <Field label="เลือกได้หลายไฟล์พร้อมกัน" hint="ชื่อตอนตั้งจากชื่อไฟล์ เรียงตามชื่อไฟล์ (MP3/M4A ไฟล์ละไม่เกิน 80 MB)"><input name="files" type="file" multiple required accept="audio/*" className="block text-sm" /></Field>
                <Submit pendingText="กำลังอัปโหลด…">อัปโหลด</Submit>
              </form>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-brown underline">หรือ เพิ่มทีละตอนด้วยลิงก์ (เช่น Google Drive)</summary>
                <form action={saveTrack} className="mt-3 space-y-3">
                  <input type="hidden" name="back" value={back} />
                  <TrackFields series={all} t={{ title: "", speaker: x.speaker, category: x.title, url: "", featured: false, sort: x.tracks.length + 1, fileKey: null, seriesId: x.id, downloadable: true }} />
                  <Submit>เพิ่มตอน</Submit>
                </form>
              </details>
            </Panel>
          )}
          <Panel title={`ตอนในชุดนี้ (${x.tracks.length})`}>
            {x.tracks.length ? (
              <ol className="space-y-2">
                {x.tracks.map((t, n) => {
                  const src = audioSrc(t);
                  return (
                    <li key={t.id} className="rounded-md border border-line p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium"><span className="text-grey num">{n + 1}.</span> {t.title}</p>
                        <span className="flex gap-1">{!t.downloadable && <Pill>ไม่ให้ดาวน์โหลด</Pill>}<Pill>{t.fileKey ? "ไฟล์ในเว็บ" : "ลิงก์ภายนอก"}</Pill></span>
                      </div>
                      {src && <audio controls preload="none" src={src} className="mt-2 w-full" />}
                      <div className="mt-1 flex flex-wrap gap-2">
                        {edit && (
                          <details className="w-full">
                            <summary className="cursor-pointer text-sm text-brown underline">แก้ไข</summary>
                            <form action={saveTrack} className="mt-3 space-y-3"><input type="hidden" name="id" value={t.id} /><input type="hidden" name="back" value={back} /><TrackFields t={t} series={all} /><Submit>บันทึก</Submit></form>
                          </details>
                        )}
                        {can(u, "dhamma", "delete") && <form action={deleteTrack}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="back" value={back} /><ConfirmSubmit message={`ลบ “${t.title}”?`}>ลบ</ConfirmSubmit></form>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : <p className="text-muted">ยังไม่มีไฟล์เสียงในชุดนี้</p>}
          </Panel>
        </div>
        <div className="space-y-5">
          {edit && (
            <Panel title="ข้อมูลชุด">
              <form action={saveSeries} className="space-y-3">
                <input type="hidden" name="id" value={x.id} />
                <Field label="ชื่อชุด"><input name="title" required defaultValue={x.title} className="input" /></Field>
                <Field label="ผู้บรรยาย"><input name="speaker" defaultValue={x.speaker} className="input" /></Field>
                <Field label="คำอธิบาย"><textarea name="summary" rows={3} defaultValue={x.summary} className="input" /></Field>
                <Field label="รูปปก">
                  {x.coverKey && <Image src={fileUrl(x.coverKey)!} alt="" width={120} height={120} className="mb-2 h-28 w-28 rounded object-cover" />}
                  <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
                </Field>
                <Field label="ไฟล์รวมทั้งชุด (ZIP)" hint={x.zipKey ? "มีไฟล์แล้ว เลือกใหม่เพื่อแทนที่" : "ไม่เกิน 95 MB ถ้าใหญ่กว่านี้ใช้ลิงก์ด้านล่าง"}>
                  <input name="zip" type="file" accept=".zip,application/zip" className="block w-full text-sm" />
                </Field>
                {x.zipKey && <Check name="removeZip" label="ลบไฟล์ ZIP" />}
                <Field label="หรือ ลิงก์ไฟล์รวมทั้งชุด" hint="เช่น ลิงก์ Google Drive ขึ้นต้นด้วย https://"><input name="zipUrl" defaultValue={x.zipUrl} className="input" /></Field>
                <Field label="ลำดับในเมนู"><input name="sort" type="number" defaultValue={x.sort} className="input" /></Field>
                <Field label="ลิงก์"><input name="slug" defaultValue={x.slug} className="input" /></Field>
                <Check name="published" label="แสดงบนเว็บไซต์" defaultChecked={x.published} />
                <Submit pendingText="กำลังบันทึก…">บันทึก</Submit>
              </form>
            </Panel>
          )}
          {can(u, "dhamma", "delete") && (
            <Panel title="ลบชุดนี้">
              <form action={deleteSeries} className="space-y-2">
                <input type="hidden" name="id" value={x.id} />
                <Check name="withTracks" label={`ลบไฟล์เสียง ${x.tracks.length} ไฟล์ด้วย`} />
                <ConfirmSubmit message={`ลบชุด “${x.title}”?`}>ลบชุด</ConfirmSubmit>
              </form>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
