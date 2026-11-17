import Image from "next/image";
import { prisma } from "@/lib/db";
import { fileUrl } from "@/lib/storage";
import { Empty, PageHead } from "@/components/site-ui";

export const metadata = { title: "พระในสังกัด", description: "รายนามพระภิกษุสามเณรที่สังกัดวัดป่ามหาไชย" };

export default async function Monks() {
  const monks = await prisma.monk.findMany({ where: { published: true }, orderBy: [{ sort: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHead eyebrow="ประวัติ" title="รายนามพระในสังกัดวัดป่ามหาไชย" />
      <div className="wrap py-12">
        {!monks.length && <Empty>ทางวัดกำลังจัดเตรียมรายนาม</Empty>}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {monks.map((m) => (
            <li key={m.id} className="card overflow-hidden">
              <div className="relative aspect-[4/5] bg-cream">
                {m.photoKey ? <Image src={fileUrl(m.photoKey)!} alt={m.name} fill sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover" /> : <Image src="/logo.webp" alt="" fill sizes="200px" className="object-contain p-12 opacity-40" />}
              </div>
              <div className="p-4">
                {m.title && <p className="text-sm text-brown">{m.title}</p>}
                <h2 className="text-lg">{m.name}</h2>
                {m.position && <p className="text-sm font-semibold text-muted">{m.position}</p>}
                <dl className="mt-2 grid grid-cols-[5.5rem_1fr] gap-y-0.5 text-sm text-muted">
                  {m.born && <><dt className="text-grey">เกิด</dt><dd>{m.born}</dd></>}
                  {m.ordained && <><dt className="text-grey">อุปสมบท</dt><dd>{m.ordained}</dd></>}
                  {m.education && <><dt className="text-grey">การศึกษา</dt><dd>{m.education}</dd></>}
                </dl>
                {m.note && <p className="mt-2 whitespace-pre-line text-sm text-muted">{m.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
