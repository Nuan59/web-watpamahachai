import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { thDate } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { PhotoGrid } from "@/components/lightbox";
import { Empty } from "@/components/site-ui";

type P = { params: Promise<{ slug: string }> };
const find = (slug: string) => prisma.album.findFirst({ where: { slug: decodeURIComponent(slug), published: true }, include: { photos: { orderBy: [{ sort: "asc" }, { createdAt: "asc" }] } } });

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const a = await find((await params).slug);
  return a ? { title: a.title, description: a.summary || `ภาพกิจกรรม ${a.title}`, openGraph: a.photos[0] ? { images: [fileUrl(a.photos[0].key)!] } : undefined } : {};
}

export default async function Album({ params }: P) {
  const a = await find((await params).slug);
  if (!a) notFound();
  return (
    <div className="wrap py-10">
      <p className="text-sm"><Link href="/gallery" className="text-brown underline">‹ คลังภาพทั้งหมด</Link></p>
      <h1 className="mt-4 text-3xl">{a.title}</h1>
      <p className="text-grey">{a.date && `${thDate(a.date, { long: true })} · `}{a.photos.length} ภาพ</p>
      {a.summary && <p className="mt-2 max-w-3xl text-muted">{a.summary}</p>}
      <div className="mt-6">{a.photos.length ? <PhotoGrid photos={a.photos.map((p) => ({ id: p.id, src: fileUrl(p.key)!, caption: p.caption }))} /> : <Empty>อัลบั้มนี้ยังไม่มีภาพ</Empty>}</div>
    </div>
  );
}
