import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { fileUrl } from "@/lib/storage";
import { InfoCard, PageHead, SubHead } from "@/components/site-ui";

export const metadata = { title: "ประวัติวัด", description: "ประวัติวัดป่ามหาไชย เจ้าอาวาส ปณิธาน และเส้นทางของวัด" };

export default async function About() {
  const s = await getSettings();
  const photo = fileUrl(s.abbotPhoto);
  return (
    <>
      <PageHead eyebrow="ความเป็นมา" title={`ประวัติ${s.templeName}`}>{s.tagline}</PageHead>
      <div className="wrap py-14">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-cream">
            {photo ? <Image src={photo} alt={s.abbotName} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" /> : <Image src="/logo.webp" alt="" fill sizes="300px" className="object-contain p-14 opacity-50" />}
          </div>
          <div>
            <h2 className="text-2xl">{s.abbotName}</h2>
            <p className="mb-6 text-brown">{s.abbotRole}</p>
            <div className="space-y-4 text-muted">{s.history.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</div>
            <Link href="/practice" className="btn mt-6">ดูแนวทางการปฏิบัติธรรม →</Link>
          </div>
        </div>

        <SubHead>ปณิธานของวัด</SubHead>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon="📖" title="ศึกษาธรรม">ส่งเสริมให้พุทธศาสนิกชนเข้าใจหลักธรรมอย่างถูกต้อง ทั้งการเรียนรู้และการนำไปใช้ในชีวิตจริง</InfoCard>
          <InfoCard icon="🧘" title="ปฏิบัติธรรม">เป็นสถานที่สัปปายะสำหรับเจริญสติภาวนา มีทั้งการปฏิบัติแบบไป-กลับและแบบพักค้างที่วัด</InfoCard>
          <InfoCard icon="🌿" title="เผยแพร่ธรรม">เผยแพร่ธรรมะผ่านการบรรยาย หนังสือ เสียงธรรม และสื่อออนไลน์ ให้ผู้ที่ไม่สะดวกเดินทางเข้าถึงได้</InfoCard>
        </div>

        <SubHead>เส้นทางของวัด</SubHead>
        <ol className="max-w-3xl border-l-2 border-line pl-7">
          {[
            ["จุดเริ่มต้น", "ก่อตั้งเป็นสำนักปฏิบัติธรรม", "ก่อตั้งด้วยศรัทธาของพุทธศาสนิกชน เพื่อเป็นสถานที่ปฏิบัติธรรมประจำจังหวัดสมุทรสาคร โดยใช้มงคลนาม “มหาไชย”"],
            ["๒๙ มิถุนายน พ.ศ. ๒๕๓๓", `${s.abbotName} รับตำแหน่งเจ้าอาวาส`, "วางแนวทางการศึกษาและปฏิบัติธรรมของวัด และนำพากิจกรรมปฏิบัติธรรมอย่างต่อเนื่อง"],
            ["ต่อเนื่องหลายทศวรรษ", "อุปสมบทหมู่และบวชชีพราหมณ์", "จัดโครงการบวชระยะสั้นให้ประชาชนในจังหวัดและพื้นที่ใกล้เคียงได้ศึกษาพระธรรมวินัย"],
            ["ปัจจุบัน", "เผยแพร่ธรรมสู่ออนไลน์", "เปิดห้องสมุดธรรมะออนไลน์และช่องทางฟังเสียงธรรม ให้ศึกษาธรรมได้ทุกที่ทุกเวลา"],
          ].map(([when, title, text]) => (
            <li key={title} className="relative pb-7">
              <span className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full border-2 border-brown bg-paper" />
              <p className="text-sm font-semibold text-brown">{when}</p>
              <p className="font-semibold">{title}</p>
              <p className="text-muted">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-lg border-l-4 border-brown bg-white p-6">
          <p className="font-display text-xl text-brown-dark">“{s.motto}”</p>
          <p className="mt-1 text-sm text-grey">— {s.mottoBy}</p>
          <p className="mt-4 text-muted"><b className="text-ink">ศึกษาธรรม</b> คือรู้ให้ถูก <b className="text-ink">นำปฏิบัติ</b> คือทำให้จริง <b className="text-ink">พัฒนาจิต</b> คือฝึกใจให้มีสติและสงบ <b className="text-ink">คิดค้นทางพ้นทุกข์</b> คือใช้ปัญญาพิจารณาจนเห็นทางออกจากทุกข์ด้วยตนเอง</p>
        </div>
      </div>
    </>
  );
}
