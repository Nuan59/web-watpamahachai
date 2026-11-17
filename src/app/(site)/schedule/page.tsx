import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { upcomingEvents } from "@/lib/events";
import { HOLY_DAYS } from "@/lib/holy-days";
import { Empty, EventCard, Notice, PageHead, SubHead } from "@/components/site-ui";

export const metadata = { title: "ตารางกิจวัตร", description: "เวลาทำวัตร สวดมนต์ ปฏิบัติธรรม และกิจกรรมวันพระของวัดป่ามหาไชย" };

export default async function Schedule() {
  const [items, s, events] = await Promise.all([prisma.scheduleItem.findMany({ orderBy: [{ sort: "asc" }, { time: "asc" }] }), getSettings(), upcomingEvents(4)]);
  const cats = [...new Set(items.map((i) => i.category))];
  return (
    <>
      <PageHead eyebrow="กำหนดการ" title="ตารางกิจวัตรของวัด">เวลาอาจเปลี่ยนตามกิจของวัด โปรดโทรสอบถามก่อนเดินทาง</PageHead>
      <div className="wrap py-14">
        <Notice tone="info">ก่อนเดินทาง โปรดโทรยืนยันเวลาที่ <a className="font-semibold underline" href={`tel:${s.phone.replace(/\D/g, "")}`}>{s.phone}</a></Notice>
        {cats.length === 0 && <div className="mt-8"><Empty>ทางวัดกำลังปรับปรุงตารางกิจวัตร</Empty></div>}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {cats.map((c) => (
            <section key={c} className="card p-5">
              <h2 className="mb-2 text-xl">{c}</h2>
              <ul>
                {items.filter((i) => i.category === c).map((i) => (
                  <li key={i.id} className="flex gap-4 border-b border-cream py-3 last:border-0">
                    <span className="w-24 shrink-0 font-semibold text-brown num">{i.time}</span>
                    <span className="text-muted">{i.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <SubHead>กิจกรรมที่จะมาถึง</SubHead>
        {events.length ? <div className="grid gap-4 md:grid-cols-2">{events.map((e) => <EventCard key={e.id} e={e} />)}</div> : <Empty>ยังไม่มีกำหนดการใหม่</Empty>}
        <p className="mt-4"><Link href="/events" className="text-brown underline">ดูกิจกรรมทั้งหมด →</Link></p>

        <SubHead>วันสำคัญทางพระพุทธศาสนา</SubHead>
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
    </>
  );
}
