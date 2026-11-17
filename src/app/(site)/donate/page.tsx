import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { fileUrl } from "@/lib/storage";
import { InfoCard, PageHead } from "@/components/site-ui";

export const metadata = { title: "ร่วมทำบุญ", description: "ช่องทางร่วมทำบุญกับวัดป่ามหาไชย ถวายภัตตาหาร สมทบทุนกิจกรรม และธรรมทาน" };

export default async function Donate() {
  const s = await getSettings();
  const qr = fileUrl(s.donateQr);
  const hasBank = s.bankName && s.bankAccount && s.bankAccountName;
  const tel = s.phone.replace(/\D/g, "");
  return (
    <>
      <PageHead eyebrow="ร่วมบุญกับวัด" title="ร่วมทำบุญ">ทุกการให้ช่วยหล่อเลี้ยงพระศาสนา และเปิดโอกาสให้ผู้อื่นได้เข้าถึงธรรมะ</PageHead>
      <div className="wrap py-14">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon="🍚" title="ถวายภัตตาหาร">ร่วมถวายภัตตาหารเช้า-เพลแด่พระภิกษุสามเณร และอาหารสำหรับผู้มาปฏิบัติธรรม <span className="mt-2 block text-sm text-grey">แจ้งความประสงค์ล่วงหน้ากับทางวัด</span></InfoCard>
          <InfoCard icon="🕯️" title="สมทบทุนกิจกรรม">สนับสนุนโครงการอุปสมบทหมู่ บวชชีพราหมณ์ และงานปฏิบัติธรรมในวันสำคัญ <span className="mt-2 block text-sm text-grey">ร่วมได้ที่ตู้รับบริจาคในวัด หรือโอนผ่านบัญชีของวัด</span></InfoCard>
          <InfoCard icon="📚" title="ธรรมทาน">ร่วมพิมพ์หนังสือธรรมะ หรือแบ่งปันลิงก์ห้องสมุดและเสียงธรรมออนไลน์ให้ผู้อื่น <span className="mt-2 block text-sm text-grey">“การให้ธรรมะเป็นทาน ย่อมชนะการให้ทั้งปวง”</span></InfoCard>
        </div>
        <section className="card mx-auto mt-10 grid max-w-3xl gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          {qr && <Image src={qr} alt="คิวอาร์โค้ดสำหรับร่วมทำบุญ" width={200} height={200} className="mx-auto rounded-md border border-line" />}
          <div>
            <h2 className="text-xl">บัญชีสำหรับร่วมทำบุญ</h2>
            {hasBank ? (
              <dl className="mt-3 grid grid-cols-[6rem_1fr] gap-y-1 text-sm">
                <dt className="text-grey">ธนาคาร</dt><dd>{s.bankName}</dd>
                <dt className="text-grey">เลขที่บัญชี</dt><dd className="font-semibold text-brown-dark num">{s.bankAccount}</dd>
                <dt className="text-grey">ชื่อบัญชี</dt><dd>{s.bankAccountName}</dd>
              </dl>
            ) : (
              <p className="mt-2 text-muted">สอบถามเลขบัญชีได้ที่ <a className="font-semibold text-brown underline" href={`tel:${tel}`}>{s.phone}</a> หรือ <a className="font-semibold text-brown underline" href={s.facebook} target="_blank" rel="noopener">เพจ Facebook ของวัด</a></p>
            )}
            <p className="mt-4 text-xs text-grey">เพื่อความปลอดภัย โปรดตรวจชื่อบัญชีให้เป็นของวัดทุกครั้งก่อนโอน หากต้องการใบอนุโมทนาบัตร แจ้งชื่อและที่อยู่กับทางวัด</p>
          </div>
        </section>
      </div>
    </>
  );
}
