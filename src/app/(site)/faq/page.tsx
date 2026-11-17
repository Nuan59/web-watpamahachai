import Link from "next/link";
import { prisma } from "@/lib/db";
import { Empty, PageHead } from "@/components/site-ui";

export const metadata = { title: "คำถามที่พบบ่อย", description: "สิ่งที่ควรรู้ก่อนมาปฏิบัติธรรมที่วัดป่ามหาไชย ค่าใช้จ่าย การสมัคร การแต่งกาย และอื่น ๆ" };

export default async function Faq() {
  const faqs = await prisma.faq.findMany({ orderBy: [{ sort: "asc" }, { question: "asc" }] });
  const cats = [...new Set(faqs.map((f) => f.category))];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) };
  return (
    <>
      <PageHead eyebrow="คำถามที่พบบ่อย" title="อยากไปปฏิบัติธรรม ต้องรู้อะไรบ้าง" />
      <div className="wrap max-w-3xl py-14">
        {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />}
        {!faqs.length && <Empty>ยังไม่มีคำถาม</Empty>}
        {cats.map((c) => (
          <section key={c} className="mb-10">
            {cats.length > 1 && <h2 className="mb-2 font-sans text-sm font-semibold tracking-wide text-grey">{c}</h2>}
            {faqs.filter((f) => f.category === c).map((f) => (
              <details key={f.id} className="group border-b border-line">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                  {f.question}<span aria-hidden className="text-xl text-brown transition group-open:rotate-45">+</span>
                </summary>
                <p className="whitespace-pre-line pb-5 text-muted">{f.answer}</p>
              </details>
            ))}
          </section>
        ))}
        <p className="text-center text-muted">ไม่พบคำตอบที่ต้องการ? <Link href="/contact" className="text-brown underline">ส่งข้อความถึงวัด →</Link></p>
      </div>
    </>
  );
}
