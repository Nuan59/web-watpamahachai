import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { plainExcerpt, renderMarkdown } from "@/lib/text";
import { PageHead } from "@/components/site-ui";

type P = { params: Promise<{ slug: string }> };
const find = (slug: string) => prisma.page.findFirst({ where: { slug: decodeURIComponent(slug), published: true } });

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await find((await params).slug);
  return p ? { title: p.title, description: plainExcerpt(p.body) } : {};
}

export default async function ContentPage({ params }: P) {
  const p = await find((await params).slug);
  if (!p) notFound();
  return (
    <>
      <PageHead eyebrow={p.navGroup || undefined} title={p.title} />
      <div className="wrap py-12"><div className="prose-wat mx-auto" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} /></div>
    </>
  );
}
