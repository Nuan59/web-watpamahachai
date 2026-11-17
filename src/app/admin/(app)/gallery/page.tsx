import Image from "next/image";
import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { thDate } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { Submit } from "@/components/form";
import { Field, Flash, Head, Panel, Pill, type SP } from "../_ui";
import { saveAlbum } from "./actions";

export const metadata = { title: "คลังภาพ" };

export default async function GalleryAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("gallery");
  const albums = await prisma.album.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }], include: { photos: { orderBy: { sort: "asc" }, take: 1 }, _count: { select: { photos: true } } } });
  return (
    <>
      <Head title="คลังภาพ" />
      <Flash sp={await searchParams} />
      {can(u, "gallery", "create") && (
        <Panel title="สร้างอัลบั้มใหม่" className="mb-5">
          <form action={saveAlbum} className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
            <Field label="ชื่ออัลบั้ม"><input name="title" required placeholder="งานทอดกฐิน ๒๕๖๙" className="input" /></Field>
            <Field label="วันที่"><input name="date" type="date" className="input" /></Field>
            <Submit>สร้างอัลบั้ม</Submit>
          </form>
        </Panel>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {albums.map((a) => (
          <Link key={a.id} href={`/admin/gallery/${a.id}`} className="overflow-hidden rounded-lg border border-line bg-white hover:border-brown">
            <div className="relative aspect-[4/3] bg-cream">{a.photos[0] && <Image src={fileUrl(a.photos[0].key)!} alt="" fill sizes="300px" className="object-cover" />}</div>
            <div className="p-3">
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-muted">{a.date && `${thDate(a.date)} · `}{a._count.photos} ภาพ {!a.published && <Pill>ซ่อน</Pill>}</p>
            </div>
          </Link>
        ))}
      </div>
      {!albums.length && <p className="text-muted">ยังไม่มีอัลบั้ม</p>}
    </>
  );
}
