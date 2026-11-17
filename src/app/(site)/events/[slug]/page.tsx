import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { seatsLeft } from "@/lib/events";
import { thRange, today } from "@/lib/dates";
import { EVENT_KIND, label } from "@/lib/labels";
import { fileUrl } from "@/lib/storage";
import { plainExcerpt, renderMarkdown } from "@/lib/text";
import { getSettings } from "@/lib/settings";
import { SignupForm } from "@/components/public-forms";

type P = { params: Promise<{ slug: string }> };
const find = async (slug: string) => prisma.event.findFirst({ where: { slug: decodeURIComponent(slug), published: true } });

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const e = await find((await params).slug);
  if (!e) return {};
  return { title: e.title, description: e.summary || plainExcerpt(e.body), openGraph: e.coverKey ? { images: [fileUrl(e.coverKey)!] } : undefined };
}

export default async function EventPage({ params }: P) {
  const e = await find((await params).slug);
  if (!e) notFound();
  const [left, s] = await Promise.all([seatsLeft(e.id, e.capacity), getSettings()]);
  const over = e.endDate < today();
  const open = e.signupOpen && !over && left !== 0;
  const cover = fileUrl(e.coverKey);
  return (
    <article className="wrap py-10">
      <p className="text-sm"><Link href="/events" className="text-brown underline">‹ กิจกรรมทั้งหมด</Link></p>
      <div className="mt-4 grid gap-10 lg:grid-cols-[1.3fr_.7fr]">
        <div>
          <p className="text-sm text-grey">{label(EVENT_KIND, e.kind)}</p>
          <h1 className="text-3xl sm:text-4xl">{e.title}</h1>
          {e.summary && <p className="mt-3 text-lg text-muted">{e.summary}</p>}
          {cover && <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg border border-line"><Image src={cover} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" priority /></div>}
          {e.body && <div className="prose-wat mt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(e.body) }} />}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <dl className="card grid grid-cols-[5.5rem_1fr] gap-y-2 p-5 text-sm">
            <dt className="text-grey">วันที่</dt><dd className="font-semibold">{thRange(e.startDate, e.endDate)}</dd>
            {e.timeText && <><dt className="text-grey">เวลา</dt><dd>{e.timeText}</dd></>}
            <dt className="text-grey">สถานที่</dt><dd>{e.location || s.templeName}</dd>
            {e.capacity != null && <><dt className="text-grey">รับจำนวน</dt><dd>{e.capacity} คน{left != null && !over && <span className="text-brown"> · เหลือ {left} ที่</span>}</dd></>}
          </dl>
          {over ? (
            <p className="card p-5 text-muted">กิจกรรมนี้ผ่านไปแล้ว ดูภาพบรรยากาศได้ที่ <Link href="/gallery" className="text-brown underline">คลังภาพ</Link></p>
          ) : open ? (
            <section className="card p-5" aria-labelledby="signup">
              <h2 id="signup" className="mb-3 text-xl">ลงทะเบียนร่วมกิจกรรม</h2>
              <SignupForm eventId={e.id} seatsLeft={left} />
            </section>
          ) : (
            <p className="card p-5 text-muted">{left === 0 ? "ที่นั่งเต็มแล้ว" : "ร่วมกิจกรรมได้โดยไม่ต้องลงทะเบียน"} สอบถามเพิ่มเติม <a className="text-brown underline" href={`tel:${s.phone.replace(/\D/g, "")}`}>{s.phone}</a></p>
          )}
        </aside>
      </div>
    </article>
  );
}
