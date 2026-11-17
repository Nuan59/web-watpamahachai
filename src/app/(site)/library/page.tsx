import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { fileUrl } from "@/lib/storage";
import { Empty, PageHead } from "@/components/site-ui";

export const metadata = { title: "ห้องสมุด", description: "หนังสือสวดมนต์ เอกสารเรียนนักธรรมและบาลี และหนังสือธรรมะ อ่านออนไลน์และดาวน์โหลดได้ฟรี" };

const ext = (d: { fileKey: string | null; url: string }) => (d.fileKey ?? d.url).split("?")[0].split(".").pop()?.toLowerCase() ?? "";

export default async function Library({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const [docs, s] = await Promise.all([prisma.libraryDoc.findMany({ orderBy: [{ sort: "asc" }, { title: "asc" }] }), getSettings()]);
  const cats = [...new Set(docs.map((d) => d.category))];
  const shown = cat && cats.includes(cat) ? [cat] : cats;
  return (
    <>
      <PageHead eyebrow="ห้องสมุด" title={cat && cats.includes(cat) ? cat : "ห้องสมุดหนังสือและเอกสาร"}>อ่านออนไลน์หรือดาวน์โหลดได้ฟรี เพื่อเป็นธรรมทาน</PageHead>
      <div className="wrap py-12">
        <nav aria-label="หมวดหนังสือ" className="mb-8 flex flex-wrap gap-2">
          <Link href="/library" aria-current={!cat ? "page" : undefined} className="btn btn-sm aria-[current=page]:border-brown aria-[current=page]:bg-brown aria-[current=page]:text-white">ทั้งหมด</Link>
          {cats.map((c) => <Link key={c} href={`/library?cat=${encodeURIComponent(c)}`} aria-current={c === cat ? "page" : undefined} className="btn btn-sm aria-[current=page]:border-brown aria-[current=page]:bg-brown aria-[current=page]:text-white">{c}</Link>)}
          <a href={s.libraryUrl} target="_blank" rel="noopener" className="btn btn-sm">ห้องสมุดธรรมะออนไลน์ ↗</a>
        </nav>
        {!docs.length && <Empty>ยังไม่มีหนังสือในห้องสมุด</Empty>}
        {shown.map((c) => (
          <section key={c} className="mb-12">
            {shown.length > 1 && <h2 className="mb-4 text-2xl">{c}</h2>}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {docs.filter((d) => d.category === c).map((d) => {
                const href = d.fileKey ? fileUrl(d.fileKey)! : d.url;
                const e = ext(d);
                return (
                  <li key={d.id} className="card flex gap-4 p-4">
                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded border border-line bg-cream">
                      {d.coverKey ? <Image src={fileUrl(d.coverKey)!} alt="" fill sizes="80px" className="object-cover" /> : <span className="grid h-full place-items-center text-xs font-semibold text-brown">{e === "zip" ? "ZIP" : "PDF"}</span>}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <h3 className="text-base leading-snug">{d.title}</h3>
                      {d.summary && <p className="line-clamp-2 text-sm text-muted">{d.summary}</p>}
                      <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        {e !== "zip" && <a href={href} target="_blank" rel="noopener" className="btn btn-sm">อ่าน</a>}
                        <a href={d.fileKey ? `${href}?dl=${encodeURIComponent(d.title)}` : href} {...(d.fileKey ? {} : { target: "_blank", rel: "noopener" })} className="btn btn-sm btn-primary">⬇ ดาวน์โหลด</a>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
