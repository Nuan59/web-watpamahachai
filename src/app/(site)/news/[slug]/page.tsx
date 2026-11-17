import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { thDate } from "@/lib/dates";
import { fileUrl } from "@/lib/storage";
import { plainExcerpt, renderMarkdown } from "@/lib/text";
import { abs } from "@/lib/site";

type P = { params: Promise<{ slug: string }> };
const find = (slug: string) => prisma.post.findFirst({ where: { slug: decodeURIComponent(slug), status: "PUBLISHED", publishedAt: { lte: new Date() } } });

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await find((await params).slug);
  if (!p) return {};
  return {
    title: p.title, description: p.excerpt || plainExcerpt(p.body), alternates: { canonical: abs(`/news/${p.slug}`) },
    openGraph: { type: "article", publishedTime: p.publishedAt?.toISOString(), images: p.coverKey ? [fileUrl(p.coverKey)!] : undefined },
  };
}

export default async function Post({ params }: P) {
  const p = await find((await params).slug);
  if (!p) notFound();
  const cover = fileUrl(p.coverKey);
  return (
    <article className="wrap max-w-3xl py-10">
      <p className="text-sm"><Link href="/news" className="text-brown underline">‹ ข่าวสารทั้งหมด</Link></p>
      <p className="mt-6 text-sm text-grey">{p.publishedAt && thDate(p.publishedAt, { long: true })}</p>
      <h1 className="text-3xl sm:text-4xl">{p.title}</h1>
      {p.excerpt && <p className="mt-3 text-lg text-muted">{p.excerpt}</p>}
      {cover && <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg border border-line"><Image src={cover} alt="" fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" priority /></div>}
      <div className="prose-wat mt-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
    </article>
  );
}
