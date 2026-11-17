import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings, mapsEmbed, mapsLink } from "@/lib/settings";
import { upcomingEvents } from "@/lib/events";
import { latestQuote, playlist, publishedPosts } from "@/lib/queries";
import { homeSlides, latestPhotos } from "@/lib/slides";
import { thDate } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { streamKind, videoIds, youtubeEmbed } from "@/lib/media";
import { HOLY_DAYS } from "@/lib/holy-days";
import { AudioPlayer } from "@/components/audio-player";
import { HeroSlides } from "@/components/hero-slides";
import { RadioPlayer } from "@/components/radio";
import { Empty, EventCard, SectionHead } from "@/components/site-ui";

const ICON: Record<string, string> = { ประวัติ: "📜", ปฏิบัติธรรม: "🪷", เสียงธรรม: "🎧", ห้องสมุด: "📚", กิจกรรม: "🗓️" };

export default async function Home() {
  const [s, events, tracks, quote, posts, slides, photos, series, pages, docCats, monks] = await Promise.all([
    getSettings(), upcomingEvents(4), playlist(), latestQuote(), publishedPosts(3), homeSlides(), latestPhotos(8),
    prisma.audioSeries.findMany({ where: { published: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }], include: { _count: { select: { tracks: true } } } }),
    prisma.page.findMany({ where: { published: true }, orderBy: [{ navGroup: "asc" }, { sort: "asc" }], select: { slug: true, title: true, navGroup: true } }),
    prisma.libraryDoc.groupBy({ by: ["category"], _min: { sort: true }, orderBy: { _min: { sort: "asc" } } }),
    prisma.monk.count({ where: { published: true } }),
  ]);
  const q = quote ?? { text: s.motto, author: s.mottoBy };
  const abbotPage = pages.find((p) => p.title.includes("เจ้าอาวาส"));
  const videos = videoIds(s.videos).slice(0, 2);
  const tiles: { href: string; label: string; icon: string }[] = [
    { href: "/about", label: "ประวัติวัดป่ามหาไชย", icon: "🏯" },
    ...(monks ? [{ href: "/monks", label: "รายชื่อพระในสังกัด", icon: "🙏" }] : []),
    { href: "/practice", label: "แนวทางปฏิบัติ", icon: "🪷" },
    { href: "/schedule", label: "กิจวัตรประจำวัน", icon: "⏰" },
    ...pages.filter((p) => p.navGroup && !p.title.includes("เจ้าอาวาส")).map((p) => ({ href: `/p/${p.slug}`, label: p.title, icon: ICON[p.navGroup] ?? "📄" })),
    { href: "/events", label: "กิจกรรมและลงทะเบียน", icon: "🗓️" },
    { href: "/news", label: "ข่าวประชาสัมพันธ์", icon: "📣" },
    ...docCats.map((c) => ({ href: `/library?cat=${encodeURIComponent(c.category)}`, label: c.category, icon: "📚" })),
    { href: "/gallery", label: "คลังภาพ", icon: "🖼️" },
    { href: "/donate", label: "ร่วมทำบุญ", icon: "🕯️" },
  ];
  const abbotPhoto = fileUrl(s.abbotPhoto);
  return (
    <>
      <HeroSlides slides={slides} />

      <section className="hero-bg border-b border-line">
        <div className="wrap grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.1fr_.9fr]">
          <div className="text-center lg:text-left">
            <Image src="/logo.webp" alt="ตราวัดป่ามหาไชย" width={slides.length ? 110 : 150} height={slides.length ? 110 : 150} priority={!slides.length} className="mx-auto mb-6 rounded-full bg-white shadow-[0_8px_30px_rgba(116,74,36,.15)] lg:mx-0" />
            <p className="eyebrow">{s.tagline}</p>
            <h1 className="mt-3 text-4xl leading-tight sm:text-5xl"><span className="whitespace-nowrap">ศึกษาธรรม</span> <span className="whitespace-nowrap text-brown">ปฏิบัติธรรม</span><br /><span className="whitespace-nowrap">เผยแพร่ธรรม</span></h1>
            <blockquote className="mt-6 font-display text-lg text-muted">“{q.text}”<footer className="mt-1 font-sans text-sm text-grey">— {q.author || "โอวาทธรรม"}</footer></blockquote>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/practice" className="btn btn-primary">แนวทางปฏิบัติธรรม</Link>
              <Link href="/events" className="btn">ดูกิจกรรมที่จะมาถึง</Link>
            </div>
          </div>
          <div className="space-y-4">
            {streamKind(s.radioUrl) && <RadioPlayer url={s.radioUrl} name={s.radioName} />}
            <div>
              <p className="mb-2 text-center text-sm font-semibold text-brown lg:text-left">🎧 ฟังธรรมได้เลยตอนนี้</p>
              <AudioPlayer tracks={tracks} compact />
            </div>
          </div>
        </div>
      </section>

      {s.almsText && (
        <section className="bg-brown text-white">
          <div className="wrap flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-4 text-center sm:text-lg">
            <span aria-hidden>🥣</span><span className="font-display font-semibold">ออกรับบิณฑบาตโปรดญาติโยมทุกวัน</span><span className="text-white/90">{s.almsText}</span>
          </div>
        </section>
      )}

      <section className="wrap py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg border border-line bg-cream">
            {abbotPhoto ? <Image src={abbotPhoto} alt={`${s.abbotTitle} (${s.abbotName})`} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" /> : <Image src="/logo.webp" alt="" fill sizes="300px" className="object-contain p-14 opacity-50" />}
          </div>
          <div className="text-center lg:text-left">
            <p className="eyebrow">เจ้าอาวาสวัดป่ามหาไชย</p>
            <h2 className="mt-1 text-3xl">{s.abbotTitle}</h2>
            <p className="text-xl text-brown">({s.abbotName})</p>
            <p className="mt-1 text-muted">{s.abbotRole}</p>
            <blockquote className="mt-6 rounded-lg border-l-4 border-brown bg-white p-5 text-left font-display text-xl text-brown-dark">“{s.motto}”</blockquote>
            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/about" className="btn">ประวัติวัด</Link>
              {abbotPage && <Link href={`/p/${abbotPage.slug}`} className="btn">ประวัติเจ้าอาวาส</Link>}
              {monks > 0 && <Link href="/monks" className="btn">พระในสังกัด</Link>}
            </div>
          </div>
        </div>
      </section>

      {series.length > 0 && (
        <section className="border-y border-line bg-cream">
          <div className="wrap py-16">
            <SectionHead eyebrow="เสียงธรรม" title="ฟังและดาวน์โหลดเสียงธรรม">{series.map((x) => x.title).slice(0, 6).join(" · ")}</SectionHead>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {series.slice(0, 6).map((x) => (
                <Link key={x.id} href={`/dhamma/${x.slug}`} className="card group flex items-center gap-4 p-4 transition hover:border-brown">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-brown-tint">
                    {x.coverKey ? <Image src={fileUrl(x.coverKey)!} alt="" fill sizes="64px" className="object-cover" /> : <span className="grid h-full place-items-center text-2xl" aria-hidden>🎧</span>}
                  </div>
                  <div className="min-w-0"><p className="font-semibold group-hover:text-brown">{x.title}</p><p className="text-sm text-muted">{x.speaker ? `${x.speaker} · ` : ""}{x._count.tracks} ตอน</p></div>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-center"><Link href="/dhamma" className="btn btn-primary">เสียงธรรมทั้งหมด</Link></p>
          </div>
        </section>
      )}

      <section className="wrap py-16">
        <SectionHead eyebrow="วัดป่ามหาไชย" title="เมนูลัด" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {tiles.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="card flex h-full min-h-20 items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-brown">
                <span aria-hidden className="text-2xl">{t.icon}</span><span className="font-medium leading-snug">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="wrap py-16">
          <SectionHead eyebrow="กำหนดการ" title="กิจกรรมที่จะมาถึง">ร่วมทำบุญ ฟังธรรม และปฏิบัติธรรมกับวัด</SectionHead>
          {events.length ? <div className="grid gap-4 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div> : <Empty>ยังไม่มีกำหนดการใหม่ ติดตามข่าวได้ที่เพจ Facebook ของวัด</Empty>}
          <p className="mt-6 text-center"><Link href="/events" className="btn">ดูกิจกรรมทั้งหมด</Link></p>
        </div>
      </section>

      {photos.length > 0 && (
        <section className="wrap py-16">
          <SectionHead eyebrow="บันทึกภาพ" title="ภาพกิจกรรมล่าสุด" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((p, k) => (
              <li key={p.id} className={k === 0 ? "col-span-2 row-span-2" : ""}>
                <Link href={p.href} className="group relative block aspect-square overflow-hidden rounded-lg border border-line bg-cream">
                  <Image src={p.src} alt={p.caption} fill sizes={k === 0 ? "(min-width:640px) 50vw, 100vw" : "(min-width:640px) 25vw, 50vw"} className="object-cover transition group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 text-xs text-white opacity-0 transition group-hover:opacity-100 sm:text-sm">{p.caption}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center"><Link href="/gallery" className="btn">ดูคลังภาพทั้งหมด</Link></p>
        </section>
      )}

      {videos.length > 0 && (
        <section className="border-y border-line bg-cream">
          <div className="wrap py-16">
            <SectionHead eyebrow="วิดีโอ" title="วิดีโอธรรมะล่าสุด" />
            <ul className="grid gap-6 md:grid-cols-2">{videos.map((id) => <li key={id} className="video-box"><iframe src={youtubeEmbed(id)} title="วิดีโอธรรมะ" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></li>)}</ul>
            <p className="mt-6 text-center"><Link href="/videos" className="btn">ดูวิดีโอทั้งหมด</Link></p>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="wrap py-16">
          <SectionHead eyebrow="ข่าวสาร" title="ข่าวประชาสัมพันธ์" />
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/news/${p.slug}`} className="card group overflow-hidden transition hover:border-brown">
                <div className="relative aspect-[16/10] bg-cream">
                  {p.coverKey ? <Image src={fileUrl(p.coverKey)!} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" /> : <Image src="/logo.webp" alt="" fill sizes="200px" className="object-contain p-8 opacity-40" />}
                </div>
                <div className="p-4">
                  <p className="text-xs text-grey">{p.publishedAt && thDate(p.publishedAt)}</p>
                  <h3 className="text-lg group-hover:text-brown">{p.title}</h3>
                  {p.excerpt && <p className="line-clamp-2 text-sm text-muted">{p.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-center"><Link href="/news" className="btn">ข่าวทั้งหมด</Link></p>
        </section>
      )}

      <section className="border-t border-line bg-cream">
        <div className="wrap py-16">
          <SectionHead eyebrow="ปฏิทินพุทธศาสนา" title="วันสำคัญที่วัดจัดกิจกรรม" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOLY_DAYS.map((h) => (
              <div key={h.name} className="rounded-lg border border-line border-l-4 border-l-brown bg-white p-5">
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs text-brown">{h.lunar}</p>
                <p className="mt-1 text-sm text-muted">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <SectionHead eyebrow="การเดินทาง" title="แผนที่วัดป่ามหาไชย" />
        <div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <div className="aspect-[16/10] overflow-hidden rounded-lg border border-line bg-cream">
            <iframe title="แผนที่วัดป่ามหาไชย" src={mapsEmbed(s.mapsQuery)} loading="lazy" className="h-full w-full border-0" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="card flex flex-col gap-3 p-6">
            <p className="font-display text-xl text-brown-dark">{s.templeName}</p>
            <p className="text-muted">{s.address}</p>
            <p><a className="text-brown underline" href={`tel:${s.phone.replace(/\D/g, "")}`}>โทร {s.phone}</a></p>
            <p><a className="break-all text-brown underline" href={`mailto:${s.email}`}>{s.email}</a></p>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <a className="btn btn-primary btn-sm" href={mapsLink(s.mapsQuery)} target="_blank" rel="noopener">นำทาง</a>
              <Link className="btn btn-sm" href="/contact">ติดต่อวัด</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
