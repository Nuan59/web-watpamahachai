import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { playlist } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { thDate } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { streamKind } from "@/lib/media";
import { AudioPlayer } from "@/components/audio-player";
import { RadioPlayer } from "@/components/radio";
import { PageHead, SubHead } from "@/components/site-ui";

export const metadata = { title: "ฟังและดาวน์โหลดเสียงธรรม", description: "เสียงธรรมบรรยาย บทสวดมนต์ และโอวาทธรรม ฟังออนไลน์และดาวน์โหลดได้ จากวัดป่ามหาไชย" };

export default async function Dhamma() {
  const [series, loose, quotes, s] = await Promise.all([
    prisma.audioSeries.findMany({ where: { published: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }], include: { _count: { select: { tracks: true } } } }),
    playlist({ seriesId: null }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    getSettings(),
  ]);
  const all = quotes.length ? quotes : [{ id: "motto", text: s.motto, author: s.mottoBy, createdAt: null as Date | null }];
  return (
    <>
      <PageHead eyebrow="เสียงธรรม" title="ฟังและดาวน์โหลดเสียงธรรม">ธรรมบรรยาย บทสวดมนต์ และโอวาทธรรม ฟังได้ทุกที่ ดาวน์โหลดเก็บไว้ฟังได้</PageHead>
      <div className="wrap py-14">
        {streamKind(s.radioUrl) && <div className="mb-10 max-w-xl"><RadioPlayer url={s.radioUrl} name={s.radioName} /></div>}
        {series.length > 0 && (
          <>
            <h2 className="mb-5 text-2xl">ชุดเสียงธรรม</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {series.map((x) => (
                <Link key={x.id} href={`/dhamma/${x.slug}`} className="card group flex gap-4 p-4 transition hover:border-brown">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-cream">
                    {x.coverKey ? <Image src={fileUrl(x.coverKey)!} alt="" fill sizes="96px" className="object-cover" /> : <span className="grid h-full place-items-center text-3xl" aria-hidden>🎧</span>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg group-hover:text-brown">{x.title}</h3>
                    {x.speaker && <p className="text-sm text-grey">{x.speaker}</p>}
                    <p className="text-sm text-muted">{x._count.tracks} ตอน{(x.zipKey || x.zipUrl) && " · ดาวน์โหลดทั้งชุดได้"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
        {loose.length > 0 && (
          <div className="mt-12 max-w-3xl">
            <h2 className="mb-4 text-2xl">{series.length ? "เสียงธรรมอื่น ๆ" : "เสียงธรรม"}</h2>
            <AudioPlayer tracks={loose} />
          </div>
        )}
        {!series.length && !loose.length && <AudioPlayer tracks={[]} />}
        <p className="mt-4 text-sm text-muted">อ่านหนังสือธรรมะเพิ่มเติมได้ที่ <Link className="text-brown underline" href="/library">ห้องสมุด</Link> หรือ <a className="text-brown underline" href={s.libraryUrl} target="_blank" rel="noopener">ห้องสมุดธรรมะออนไลน์ ↗</a></p>
        <div className="max-w-3xl">
          <SubHead>คติธรรมและโอวาทธรรม</SubHead>
          <ul className="space-y-5" id="quotes">
            {all.map((q) => (
              <li key={q.id} className="rounded-lg border-l-4 border-brown bg-white p-5">
                <p className="whitespace-pre-line font-display text-lg text-brown-dark">“{q.text}”</p>
                <p className="mt-1 text-sm text-grey">— {q.author || "โอวาทธรรม"}{q.createdAt && ` · ${thDate(q.createdAt)}`}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
