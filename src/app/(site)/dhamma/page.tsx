import { prisma } from "@/lib/db";
import { playlist } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { thDate } from "@/lib/dates";
import { AudioPlayer } from "@/components/audio-player";
import { PageHead, SubHead } from "@/components/site-ui";

export const metadata = { title: "เสียงธรรมและโอวาทธรรม", description: "ฟังธรรมบรรยายและบทสวดมนต์ออนไลน์ และอ่านโอวาทธรรมจากวัดป่ามหาไชย" };

export default async function Dhamma() {
  const [tracks, quotes, s] = await Promise.all([playlist(), prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 30 }), getSettings()]);
  const all = quotes.length ? quotes : [{ id: "motto", text: s.motto, author: s.mottoBy, createdAt: null as Date | null }];
  return (
    <>
      <PageHead eyebrow="เสียงธรรม" title="ฟังธรรม อ่านโอวาท">ฟังได้ทุกที่ เล่นต่อเนื่องอัตโนมัติ</PageHead>
      <div className="wrap max-w-3xl py-14">
        <AudioPlayer tracks={tracks} />
        <p className="mt-3 text-sm text-muted">อ่านหนังสือธรรมะเพิ่มเติมได้ที่ <a className="text-brown underline" href={s.libraryUrl} target="_blank" rel="noopener">ห้องสมุดธรรมะออนไลน์ ↗</a></p>
        <SubHead>โอวาทธรรม</SubHead>
        <ul className="space-y-5">
          {all.map((q) => (
            <li key={q.id} className="rounded-lg border-l-4 border-brown bg-white p-5">
              <p className="whitespace-pre-line font-display text-lg text-brown-dark">“{q.text}”</p>
              <p className="mt-1 text-sm text-grey">— {q.author || "โอวาทธรรม"}{q.createdAt && ` · ${thDate(q.createdAt)}`}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
