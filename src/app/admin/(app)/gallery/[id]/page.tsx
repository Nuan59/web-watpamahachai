import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { isoDay } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { ConfirmSubmit, Submit } from "@/components/form";
import { Check, Field, Flash, Head, Panel, type SP } from "../../_ui";
import { deleteAlbum, deletePhoto, saveAlbum, savePhoto, uploadPhotos } from "../actions";

export const metadata = { title: "อัลบั้มภาพ" };

export default async function AlbumAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const u = await requirePerm("gallery");
  const a = await prisma.album.findUnique({ where: { id: (await params).id }, include: { photos: { orderBy: [{ sort: "asc" }, { createdAt: "asc" }] } } });
  if (!a) notFound();
  const edit = can(u, "gallery", "edit");
  return (
    <>
      <Head title={a.title} crumbs={[["คลังภาพ", "/admin/gallery"], [a.title]]} actions={a.published && <Link href={`/gallery/${a.slug}`} target="_blank" className="btn btn-sm">ดูบนเว็บ ↗</Link>} />
      <Flash sp={await searchParams} />
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {can(u, "gallery", "create") && (
            <Panel title="เพิ่มภาพ">
              <form action={uploadPhotos} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="albumId" value={a.id} />
                <Field label="เลือกได้หลายภาพพร้อมกัน" hint="JPG, PNG, WEBP ภาพละไม่เกิน 10 MB"><input name="photos" type="file" multiple required accept="image/jpeg,image/png,image/webp" className="block text-sm" /></Field>
                <Submit pendingText="กำลังอัปโหลด…">อัปโหลด</Submit>
              </form>
            </Panel>
          )}
          <Panel title={`ภาพในอัลบั้ม (${a.photos.length})`}>
            {a.photos.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {a.photos.map((p) => (
                  <li key={p.id} className="rounded-md border border-line p-2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded bg-cream"><Image src={fileUrl(p.key)!} alt={p.caption} fill sizes="300px" className="object-cover" /></div>
                    {edit && (
                      <form action={savePhoto} className="mt-2 flex gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input name="caption" defaultValue={p.caption} placeholder="คำบรรยายภาพ" aria-label="คำบรรยายภาพ" className="input min-h-9 py-1 text-sm" />
                        <input name="sort" type="number" defaultValue={p.sort} aria-label="ลำดับ" className="input min-h-9 w-16 py-1 text-sm" />
                        <Submit className="btn btn-sm">บันทึก</Submit>
                      </form>
                    )}
                    {can(u, "gallery", "delete") && <form action={deletePhoto} className="mt-2"><input type="hidden" name="id" value={p.id} /><ConfirmSubmit message="ลบภาพนี้?">ลบภาพ</ConfirmSubmit></form>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted">ยังไม่มีภาพ</p>}
          </Panel>
        </div>
        <div className="space-y-5">
          {edit && (
            <Panel title="ข้อมูลอัลบั้ม">
              <form action={saveAlbum} className="space-y-3">
                <input type="hidden" name="id" value={a.id} />
                <Field label="ชื่ออัลบั้ม"><input name="title" required defaultValue={a.title} className="input" /></Field>
                <Field label="วันที่"><input name="date" type="date" defaultValue={a.date ? isoDay(a.date) : undefined} className="input" /></Field>
                <Field label="คำอธิบาย"><textarea name="summary" rows={3} defaultValue={a.summary} className="input" /></Field>
                <Field label="ลิงก์"><input name="slug" defaultValue={a.slug} className="input" /></Field>
                <Check name="published" label="แสดงบนเว็บไซต์" defaultChecked={a.published} />
                <Submit>บันทึก</Submit>
              </form>
            </Panel>
          )}
          {can(u, "gallery", "delete") && (
            <Panel title="ลบอัลบั้ม">
              <form action={deleteAlbum}><input type="hidden" name="id" value={a.id} /><ConfirmSubmit message={`ลบอัลบั้ม “${a.title}” และภาพทั้งหมด ${a.photos.length} ภาพ? กู้คืนไม่ได้`}>ลบอัลบั้มและภาพทั้งหมด</ConfirmSubmit></form>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
