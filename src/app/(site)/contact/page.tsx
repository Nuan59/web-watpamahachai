import { getSettings, mapsEmbed, mapsLink } from "@/lib/settings";
import { ContactForm } from "@/components/public-forms";
import { InfoCard, PageHead, SubHead } from "@/components/site-ui";

export const metadata = { title: "ติดต่อและการเดินทาง", description: "ที่อยู่ เบอร์โทร แผนที่ และวิธีเดินทางไปวัดป่ามหาไชย จังหวัดสมุทรสาคร" };

export default async function Contact() {
  const s = await getSettings();
  const tel = s.phone.replace(/\D/g, "");
  const ld = { "@context": "https://schema.org", "@type": "BuddhistTemple", name: s.templeName, address: s.address, telephone: s.phone, email: s.email, sameAs: [s.facebook] };
  return (
    <>
      <PageHead eyebrow="ติดต่อและการเดินทาง" title={`มา${s.templeName}`}>ยินดีต้อนรับทุกท่าน หากมาครั้งแรกแนะนำให้โทรสอบถามก่อนเดินทาง</PageHead>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="wrap py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-cream">
            <iframe title={`แผนที่${s.templeName}`} src={mapsEmbed(s.mapsQuery)} loading="lazy" className="h-full w-full border-0" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="card p-6">
            <h2 className="text-xl">ข้อมูลติดต่อ</h2>
            <dl className="mt-4 space-y-3">
              <div><dt className="text-sm text-grey">ที่อยู่</dt><dd>{s.address}</dd></div>
              <div><dt className="text-sm text-grey">โทรศัพท์</dt><dd><a className="text-brown underline" href={`tel:${tel}`}>{s.phone}</a></dd></div>
              <div><dt className="text-sm text-grey">อีเมล</dt><dd><a className="break-all text-brown underline" href={`mailto:${s.email}`}>{s.email}</a></dd></div>
              {s.lineId && <div><dt className="text-sm text-grey">LINE</dt><dd>{s.lineId}</dd></div>}
              <div><dt className="text-sm text-grey">Facebook</dt><dd><a className="text-brown underline" href={s.facebook} target="_blank" rel="noopener">เพจวัดป่ามหาไชย</a></dd></div>
              {s.hours && <div><dt className="text-sm text-grey">เวลาเปิด</dt><dd>{s.hours}</dd></div>}
            </dl>
            <a className="btn btn-primary mt-6" href={mapsLink(s.mapsQuery)} target="_blank" rel="noopener">นำทางด้วย Google Maps</a>
          </div>
        </div>
        <SubHead>คำแนะนำการเดินทาง</SubHead>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard icon="🚗" title="รถยนต์ส่วนตัว">{s.travelCar}</InfoCard>
          <InfoCard icon="🚌" title="รถโดยสารสาธารณะ">{s.travelPublic}</InfoCard>
          <InfoCard icon="👋" title="มาครั้งแรก">ติดต่อที่ศาลาหรือสำนักงานวัดเมื่อมาถึง แต่งกายสุภาพ และโทรแจ้งล่วงหน้าหากมาเป็นหมู่คณะ</InfoCard>
        </div>
        <SubHead>ส่งข้อความถึงวัด</SubHead>
        <div className="card max-w-3xl p-6"><ContactForm /></div>
      </div>
    </>
  );
}
