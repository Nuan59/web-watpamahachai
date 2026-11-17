import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import "../globals.css";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { siteNav } from "@/lib/nav";
import { DesktopNav, MobileNav } from "@/components/site-nav";

// Content changes from the back office show up on the next page load.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "วัดป่ามหาไชย — สำนักปฏิบัติธรรมประจำจังหวัดสมุทรสาคร", template: "%s · วัดป่ามหาไชย" },
  description: "วัดป่ามหาไชย สำนักปฏิบัติธรรมประจำจังหวัดสมุทรสาคร (ธรรมยุต) แห่งที่ ๑ ศึกษาธรรม ปฏิบัติธรรม เผยแพร่ธรรม ตารางกิจกรรม เสียงธรรม และการเดินทาง",
  icons: { icon: "/logo.webp", apple: "/apple-icon.png" },
  openGraph: { type: "website", locale: "th_TH", siteName: "วัดป่ามหาไชย", images: ["/og.jpg"] },
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, pages] = await Promise.all([
    getSettings(),
    prisma.page.findMany({ where: { published: true, navGroup: { not: "" } }, orderBy: [{ sort: "asc" }, { title: "asc" }], select: { slug: true, title: true, navGroup: true } }),
  ]);
  const nav = siteNav(pages);
  return (
    <html lang="th">
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">ข้ามไปที่เนื้อหา</a>
        <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
          <div className="wrap flex items-center gap-4 py-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.webp" alt="" width={44} height={44} className="rounded-full bg-white" priority />
              <span className="font-display text-lg font-semibold leading-tight text-brown-dark">{s.templeName}</span>
            </Link>
            <nav aria-label="เมนูหลัก" className="ml-auto">
              <DesktopNav items={nav} />
            </nav>
            <a href={s.libraryUrl} target="_blank" rel="noopener" className="btn btn-primary btn-sm hidden xl:inline-flex">ห้องสมุดธรรมะ</a>
            <div className="ml-auto lg:hidden">
              <MobileNav items={[...nav, { href: s.libraryUrl, label: "ห้องสมุดธรรมะออนไลน์ ↗" }]} footer={<>{s.address}<br />โทร {s.phone}</>} />
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
        <footer className="mt-20 border-t-4 border-brown bg-cream">
          <div className="wrap grid gap-10 py-12 text-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <Image src="/logo.webp" alt="" width={56} height={56} className="rounded-full bg-white" />
                <p className="font-display text-xl font-semibold text-brown-dark">{s.templeName}</p>
              </div>
              <p className="mt-3 max-w-xs text-muted">{s.tagline}</p>
              <p className="mt-2 font-display text-brown-dark">“{s.motto}”</p>
            </div>
            <div>
              <h2 className="mb-3 font-sans text-sm font-semibold text-grey">ติดต่อวัด</h2>
              <p className="text-muted">{s.address}</p>
              <p className="mt-2"><a className="hover:text-brown" href={`tel:${s.phone.replace(/\D/g, "")}`}>โทร {s.phone}</a></p>
              <p><a className="break-all hover:text-brown" href={`mailto:${s.email}`}>{s.email}</a></p>
              {s.lineId && <p>LINE: {s.lineId}</p>}
            </div>
            <div>
              <h2 className="mb-3 font-sans text-sm font-semibold text-grey">เมนู</h2>
              <ul className="space-y-1.5">
                {nav.slice(1).map((i) => <li key={i.href}><Link className="text-muted hover:text-brown" href={i.href}>{i.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 font-sans text-sm font-semibold text-grey">ช่องทางอื่น</h2>
              <ul className="space-y-1.5">
                <li><a className="text-muted hover:text-brown" href={s.facebook} target="_blank" rel="noopener">Facebook เพจวัดป่ามหาไชย</a></li>
                <li><a className="text-muted hover:text-brown" href={s.libraryUrl} target="_blank" rel="noopener">ห้องสมุดธรรมะออนไลน์</a></li>
                <li><Link className="text-muted hover:text-brown" href="/news">ข่าวสารของวัด</Link></li>
                <li><Link className="text-muted hover:text-brown" href="/gallery">คลังภาพกิจกรรม</Link></li>
              </ul>
            </div>
          </div>
          <div className="wrap flex flex-wrap justify-between gap-2 border-t border-line py-5 text-xs text-grey">
            <span>© {s.templeName}</span>
            <Link href="/admin" className="hover:text-brown">สำหรับเจ้าหน้าที่</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
