import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { upcomingEvents } from "@/lib/events";
import { latestQuote, playlist, publishedPosts } from "@/lib/queries";
import { thDate } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { HOLY_DAYS } from "@/lib/holy-days";
import { AudioPlayer } from "@/components/audio-player";
import { HeroSlides } from "@/components/hero-slides";
import { homeSlides, latestPhotos } from "@/lib/slides";
import { Empty, EventCard, SectionHead } from "@/components/site-ui";

const START = [
  { href: "/practice", icon: "🪷", title: "มาปฏิบัติธรรม", text: "แนวทางการปฏิบัติ ขั้นตอนการมา ศีล ๘ และสิ่งที่ต้องเตรียม" },
  { href: "/events", icon: "🗓️", title: "กิจกรรมของวัด", text: "งานบุญ วันสำคัญ และรอบปฏิบัติธรรม ลงทะเบียนออนไลน์ได้" },
  { href: "/dhamma", icon: "🎧", title: "ฟังเสียงธรรม", text: "ธรรมบรรยายและบทสวดมนต์ เล่นต่อเนื่องอัตโนมัติ" },
  { href: "/schedule", icon: "⏰", title: "ตารางกิจวัตร", text: "เวลาทำวัตร สวดมนต์ และกิจกรรมวันพระ" },
  { href: "/donate", icon: "🙏", title: "ร่วมทำบุญ", text: "ถวายภัตตาหาร สมทบทุนกิจกรรม และธรรมทาน" },
  { href: "/contact", icon: "📍", title: "การเดินทาง", text: "แผนที่ เบอร์โทร และคำแนะนำการมาวัดครั้งแรก" },
];

export default async function Home() {
  const [s, events, tracks, quote, posts, slides, photos] = await Promise.all([getSettings(), upcomingEvents(4), playlist(), latestQuote(), publishedPosts(3), homeSlides(), latestPhotos(8)]);
  const q = quote ?? { text: s.motto, author: s.mottoBy };
  return (
    <>
      <HeroSlides slides={slides} />
      <section className="hero-bg border-b border-line">
        <div className="wrap grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_.9fr]">
          <div className="text-center lg:text-left">
            <Image src="/logo.webp" alt="ตราวัดป่ามหาไชย" width={slides.length ? 96 : 150} height={slides.length ? 96 : 150} priority={!slides.length} className="mx-auto mb-6 rounded-full bg-white shadow-[0_8px_30px_rgba(116,74,36,.15)] lg:mx-0" />
            <p className="eyebrow">{s.tagline}</p>
            <h1 className="mt-3 text-4xl leading-tight sm:text-5xl"><span className="whitespace-nowrap">ศึกษาธรรม</span> <span className="whitespace-nowrap text-brown">ปฏิบัติธรรม</span><br /><span className="whitespace-nowrap">เผยแพร่ธรรม</span></h1>
            <blockquote className="mt-6 font-display text-lg text-muted">“{q.text}”<footer className="mt-1 font-sans text-sm text-grey">— {q.author || "โอวาทธรรม"}</footer></blockquote>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="/practice" className="btn btn-primary">แนวทางปฏิบัติธรรม</Link>
              <Link href="/events" className="btn">ดูกิจกรรมที่จะมาถึง</Link>
            </div>
          </div>
          <div>
            <p className="mb-2 text-center text-sm font-semibold text-brown lg:text-left">🎧 ฟังธรรมได้เลยตอนนี้</p>
            <AudioPlayer tracks={tracks} compact />
          </div>
        </div>
      </section>

      <section className="wrap py-14">
        <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4 [&>div]:bg-white [&>div]:p-5 [&>div]:text-center">
          <div><dt className="text-sm text-muted">เจ้าอาวาสรูปปัจจุบัน</dt><dd className="font-display text-xl text-brown-dark">ตั้งแต่ พ.ศ. ๒๕๓๓</dd></div>
          <div><dt className="text-sm text-muted">พันธกิจของวัด</dt><dd className="font-display text-xl text-brown-dark">ศึกษา · ปฏิบัติ · เผยแพร่</dd></div>
          <div><dt className="text-sm text-muted">เข้ากราบพระ</dt><dd className="font-display text-xl text-brown-dark">{s.hours || "ประชาชนทั่วไปเข้าได้"}</dd></div>
          <div><dt className="text-sm text-muted">หนังสือและเสียงธรรม</dt><dd className="font-display text-xl text-brown-dark">อ่าน/ฟังฟรีออนไลน์</dd></div>
        </dl>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="wrap grid gap-10 py-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">ยินดีต้อนรับ</p>
            <h2 className="mt-1 text-3xl">สำนักปฏิบัติธรรมประจำจังหวัดสมุทรสาคร</h2>
            <p className="mt-4 text-muted">วัดป่ามหาไชย ตั้งอยู่ที่ตำบลบ้านเกาะ อำเภอเมือง จังหวัดสมุทรสาคร เป็นวัดสายปฏิบัติที่เปิดให้พุทธศาสนิกชนทุกเพศทุกวัยเข้ามาศึกษาและปฏิบัติธรรม ในบรรยากาศสงบ เรียบง่าย เหมาะแก่การพักใจจากความวุ่นวายของชีวิตประจำวัน</p>
            <p className="mt-3 text-muted">ไม่ว่าจะเป็นผู้เริ่มต้นที่อยากลองนั่งสมาธิครั้งแรก หรือผู้ที่ต้องการบวชเพื่อศึกษาพระธรรมวินัยอย่างจริงจัง วัดมีกิจกรรมรองรับตามความพร้อมของแต่ละคน</p>
            <Link href="/about" className="btn mt-6">อ่านประวัติวัด →</Link>
          </div>
          <ol className="grid gap-3">
            {[["ศึกษาธรรม", "เรียนรู้หลักธรรมคำสอนผ่านการฟังธรรม อ่านหนังสือ และการสนทนาธรรม"], ["ปฏิบัติธรรม", "ฝึกเจริญสติ สมาธิ และปัญญา ด้วยการสวดมนต์ เดินจงกรม และนั่งสมาธิ"], ["เผยแพร่ธรรม", "แบ่งปันธรรมะสู่สังคม ทั้งที่วัดและออนไลน์ ให้ทุกคนเข้าถึงได้โดยไม่มีค่าใช้จ่าย"]].map(([t, d], n) => (
              <li key={t} className="card flex gap-4 p-5">
                <span className="font-display text-3xl leading-none text-brown">{["๑", "๒", "๓"][n]}</span>
                <span><span className="block font-semibold">{t}</span><span className="text-sm text-muted">{d}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap py-16">
        <SectionHead eyebrow="กำหนดการ" title="กิจกรรมที่จะมาถึง">ร่วมทำบุญ ฟังธรรม และปฏิบัติธรรมกับวัด</SectionHead>
        {events.length ? (
          <div className="grid gap-4 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div>
        ) : (
          <Empty>ยังไม่มีกำหนดการใหม่ ติดตามข่าวได้ที่เพจ Facebook ของวัด</Empty>
        )}
        <p className="mt-6 text-center"><Link href="/events" className="btn">ดูกิจกรรมทั้งหมด</Link></p>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="wrap py-16">
          <SectionHead eyebrow="เริ่มต้นที่นี่" title="สิ่งที่คุณทำได้กับวัดป่ามหาไชย" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {START.map((c) => (
              <Link key={c.href} href={c.href} className="card group flex flex-col gap-1 p-6 transition hover:-translate-y-0.5 hover:border-brown">
                <span aria-hidden className="text-2xl">{c.icon}</span>
                <span className="mt-1 font-display text-lg font-semibold text-brown-dark">{c.title}</span>
                <span className="flex-1 text-sm text-muted">{c.text}</span>
                <span className="mt-2 text-sm font-semibold text-brown">ดูรายละเอียด →</span>
              </Link>
            ))}
            <a href={s.libraryUrl} target="_blank" rel="noopener" className="card group flex flex-col gap-1 bg-brown p-6 text-white transition hover:-translate-y-0.5 sm:col-span-2 lg:col-span-3 lg:flex-row lg:items-center lg:justify-between">
              <span><span className="block font-display text-xl font-semibold">📚 ห้องสมุดธรรมะออนไลน์</span><span className="text-sm text-white/85">อ่านหนังสือธรรมะฟรีผ่านมือถือ ไม่ต้องสมัครสมาชิก ไม่ต้องติดตั้งแอป</span></span>
              <span className="mt-3 inline-flex rounded-md bg-white px-4 py-2 font-semibold text-brown lg:mt-0">เปิดห้องสมุด ↗</span>
            </a>
          </div>
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

      {posts.length > 0 && (
        <section className="wrap py-16">
          <SectionHead eyebrow="ข่าวสาร" title="ข่าวและกิจกรรมล่าสุด" />
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
    </>
  );
}
