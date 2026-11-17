import Image from "next/image";
import Link from "next/link";
import { publishedPosts } from "@/lib/queries";
import { thDate } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { Empty, PageHead } from "@/components/site-ui";

export const metadata = { title: "ข่าวสาร", description: "ข่าวสาร ประกาศ และบันทึกกิจกรรมของวัดป่ามหาไชย" };

export default async function News() {
  const posts = await publishedPosts();
  return (
    <>
      <PageHead eyebrow="ข่าวสาร" title="ข่าวสารและประกาศของวัด" />
      <div className="wrap py-14">
        {!posts.length && <Empty>ยังไม่มีข่าวสาร</Empty>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={`/news/${p.slug}`} className="card group overflow-hidden transition hover:border-brown">
              <div className="relative aspect-[16/10] bg-cream">
                {p.coverKey ? <Image src={fileUrl(p.coverKey)!} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" /> : <Image src="/logo.webp" alt="" fill sizes="200px" className="object-contain p-10 opacity-40" />}
              </div>
              <div className="p-5">
                <p className="text-xs text-grey">{p.publishedAt && thDate(p.publishedAt)}</p>
                <h2 className="text-lg group-hover:text-brown">{p.title}</h2>
                {p.excerpt && <p className="mt-1 line-clamp-3 text-sm text-muted">{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
