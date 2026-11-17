import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { InfoCard, PageHead, SubHead } from "@/components/site-ui";

export const metadata = { title: "แนวทางปฏิบัติธรรม", description: "ขั้นตอนการมาปฏิบัติธรรม ศีล ๘ การแต่งกาย และสิ่งที่ควรเตรียมก่อนมาวัดป่ามหาไชย" };

const PRECEPTS = [
  "เว้นจากการฆ่าและเบียดเบียนสัตว์", "เว้นจากการลักทรัพย์ หยิบของที่ไม่ได้รับอนุญาต", "เว้นจากการประพฤติผิดพรหมจรรย์",
  "เว้นจากการพูดเท็จ ส่อเสียด หยาบคาย เพ้อเจ้อ", "เว้นจากการดื่มสุราและสิ่งเสพติดทุกชนิด", "เว้นจากการรับประทานอาหารหลังเที่ยงวัน",
  "เว้นจากการฟ้อนรำ ขับร้อง ดูการละเล่น และการแต่งตัวด้วยเครื่องประดับ", "เว้นจากการนอนบนที่นอนสูงใหญ่และหรูหรา",
];

export default async function Practice() {
  const s = await getSettings();
  return (
    <>
      <PageHead eyebrow="แนวทางของวัด" title="ปฏิบัติธรรมนำสุขสู่ประชาชน">สามช่องทางหลักที่วัดเปิดให้พุทธศาสนิกชนได้เข้าร่วม</PageHead>
      <div className="wrap py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon="🙏" title="ปฏิบัติธรรมประจำวันสำคัญ">ทำวัตร สวดมนต์ และปฏิบัติธรรมในวันสำคัญทางพระพุทธศาสนา เปิดให้ประชาชนทั่วไปเข้าร่วมได้</InfoCard>
          <InfoCard icon="☸️" title="อุปสมบทหมู่ / บวชชีพราหมณ์">โครงการบวชระยะสั้นสำหรับผู้ที่ต้องการศึกษาพระธรรมวินัยอย่างจริงจัง <b className="text-ink">ต้องสมัครด้วยตนเองที่วัด</b></InfoCard>
          <InfoCard icon="📚" title="ห้องสมุดธรรมะออนไลน์">อ่านหนังสือธรรมะฟรีผ่านมือถือ ไม่ต้องเดินทางมาที่วัด <a className="text-brown underline" href={s.libraryUrl} target="_blank" rel="noopener">เปิดห้องสมุด ↗</a></InfoCard>
        </div>

        <SubHead>ขั้นตอนการมาปฏิบัติธรรม</SubHead>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["ดูรอบกิจกรรม", <>ดูวันที่และรายละเอียดที่หน้า <Link className="text-brown underline" href="/events">กิจกรรม</Link> รอบที่เปิดลงทะเบียนกรอกชื่อออนไลน์ได้</>],
            ["ติดต่อหรือสมัคร", <>โทร {s.phone} หรือทักเพจ Facebook สำหรับโครงการบวช ต้องสมัครที่วัดพร้อมบัตรประชาชน</>],
            ["เตรียมตัว", "เตรียมชุดขาว ของใช้ส่วนตัว และร่างกายจิตใจให้พร้อม ดูรายการด้านล่าง"],
            ["เข้าวัดและปฏิบัติ", "มาถึงก่อนเวลาเพื่อรายงานตัว รับฟังระเบียบ สมาทานศีล แล้วเริ่มปฏิบัติ"],
          ].map(([t, d], n) => (
            <li key={n} className="card relative p-5 pt-7">
              <span className="absolute -top-3.5 left-5 grid h-7 w-7 place-items-center rounded-full bg-brown text-sm font-semibold text-white">{n + 1}</span>
              <p className="font-semibold">{t}</p>
              <p className="text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>

        <SubHead>รูปแบบการปฏิบัติ</SubHead>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon="🕯️" title="ทำวัตรสวดมนต์">ทำวัตรเช้า-เย็นร่วมกัน น้อมระลึกถึงคุณพระรัตนตรัยและเตรียมจิตก่อนภาวนา</InfoCard>
          <InfoCard icon="🚶" title="เดินจงกรม">ฝึกสติผ่านการเดินช้า ๆ รู้ตัวทุกย่างก้าว ช่วยให้จิตตั้งมั่นและแก้ง่วง</InfoCard>
          <InfoCard icon="🧘" title="นั่งสมาธิ">กำหนดรู้ลมหายใจหรือคำบริกรรม ฝึกให้จิตสงบและเห็นความเป็นจริงของกายใจ</InfoCard>
        </div>

        <SubHead>ศีล ๘ สำหรับผู้มาปฏิบัติ</SubHead>
        <ol className="grid gap-x-8 sm:grid-cols-2">
          {PRECEPTS.map((p, i) => (
            <li key={p} className="flex gap-4 border-b border-line py-3 text-muted"><span className="font-display text-lg text-brown">{i + 1}</span>{p}</li>
          ))}
        </ol>

        <SubHead>สิ่งที่ควรรู้ก่อนมา</SubHead>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon="🎒" title="สิ่งที่ควรเตรียม"><ul><li>ชุดขาวสุภาพ ๒–๓ ชุด</li><li>ผ้าห่มบาง หมอนเล็ก (ถ้าต้องการ)</li><li>ของใช้ส่วนตัว ยาประจำตัว</li><li>บัตรประชาชนตัวจริง</li><li>ยากันยุง ไฟฉาย กระบอกน้ำ</li></ul></InfoCard>
          <InfoCard icon="👕" title="การแต่งกาย"><ul><li>ผู้มาปฏิบัติธรรมแต่งชุดขาวล้วน</li><li>ผู้มาทำบุญทั่วไปแต่งกายสุภาพ สีสุภาพ</li><li>งดเสื้อแขนกุด สายเดี่ยว กางเกงขาสั้น กระโปรงสั้น</li><li>งดเครื่องประดับระหว่างปฏิบัติ</li></ul></InfoCard>
          <InfoCard icon="📵" title="ข้อควรปฏิบัติในวัด"><ul><li>ปิดหรือฝากโทรศัพท์ระหว่างปฏิบัติ</li><li>สำรวมกาย วาจา งดพูดคุยโดยไม่จำเป็น</li><li>ตรงต่อเวลาในทุกกิจกรรม</li><li>ช่วยกันรักษาความสะอาดของสถานที่</li></ul></InfoCard>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/schedule" className="btn btn-primary">ดูตารางกิจวัตร</Link>
          <Link href="/faq" className="btn">คำถามที่พบบ่อย</Link>
        </div>
      </div>
    </>
  );
}
