import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { thDate } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { Empty, PageHead } from "@/components/site-ui";

export const metadata = { title: "คลังภาพกิจกรรม", description: "ภาพบรรยากาศงานบุญและกิจกรรมปฏิบัติธรรมของวัดป่ามหาไชย" };

export default async function Gallery() {
  const [albums, s] = await Promise.all([
    prisma.album.findMany({ where: { published: true }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], include: { photos: { orderBy: { sort: "asc" }, take: 1 }, _count: { select: { photos: true } } } }),
    getSettings(),
  ]);
  return (
    <>
      <PageHead eyebrow="บันทึกภาพ" title="คลังภาพกิจกรรมของวัด" />
      <div className="wrap py-14">
        {!albums.length && <Empty>ยังไม่มีอัลบั้มภาพ</Empty>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <Link key={a.id} href={`/gallery/${a.slug}`} className="card group overflow-hidden transition hover:border-brown">
              <div className="relative aspect-[4/3] bg-cream">
                {a.photos[0] ? <Image src={fileUrl(a.photos[0].key)!} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" /> : <Image src="/logo.webp" alt="" fill sizes="200px" className="object-contain p-10 opacity-40" />}
              </div>
              <div className="p-4">
                <h2 className="text-lg group-hover:text-brown">{a.title}</h2>
                <p className="text-sm text-grey">{a.date && `${thDate(a.date)} · `}{a._count.photos} ภาพ</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center"><a className="btn" href={s.facebook} target="_blank" rel="noopener">ดูภาพเพิ่มเติมทางเพจ Facebook ↗</a></p>
      </div>
    </>
  );
}
