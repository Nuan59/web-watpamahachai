import { prisma } from "@/lib/db";
import { today } from "@/lib/dates";
import { Empty, EventCard, PageHead, SubHead } from "@/components/site-ui";

export const metadata = { title: "กิจกรรม", description: "งานบุญ วันสำคัญทางพระพุทธศาสนา รอบปฏิบัติธรรม และโครงการบวชของวัดป่ามหาไชย" };

export default async function Events() {
  const t = today();
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({ where: { published: true, endDate: { gte: t } }, orderBy: { startDate: "asc" } }),
    prisma.event.findMany({ where: { published: true, endDate: { lt: t } }, orderBy: { startDate: "desc" }, take: 12 }),
  ]);
  return (
    <>
      <PageHead eyebrow="กำหนดการ" title="กิจกรรมของวัด">ร่วมทำบุญ ฟังธรรม และปฏิบัติธรรม กิจกรรมที่เปิดลงทะเบียนกรอกชื่อออนไลน์ได้</PageHead>
      <div className="wrap py-14">
        <h2 className="sr-only">กิจกรรมที่จะมาถึง</h2>
        {upcoming.length ? <div className="grid gap-4 md:grid-cols-2">{upcoming.map((e) => <EventCard key={e.id} e={e} />)}</div> : <Empty>ยังไม่มีกำหนดการใหม่ ติดตามข่าวได้ที่เพจ Facebook ของวัด</Empty>}
        {past.length > 0 && (
          <>
            <SubHead>กิจกรรมที่ผ่านมา</SubHead>
            <div className="grid gap-4 opacity-80 md:grid-cols-2">{past.map((e) => <EventCard key={e.id} e={{ ...e, signupOpen: false }} />)}</div>
          </>
        )}
      </div>
    </>
  );
}
