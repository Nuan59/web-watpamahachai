import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { abs } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, events, albums, pages] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
    prisma.event.findMany({ where: { published: true }, select: { slug: true, createdAt: true } }),
    prisma.album.findMany({ where: { published: true }, select: { slug: true, createdAt: true } }),
    prisma.page.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const fixed = ["/", "/about", "/practice", "/schedule", "/events", "/news", "/dhamma", "/gallery", "/faq", "/donate", "/contact"];
  return [
    ...fixed.map((p) => ({ url: abs(p) })),
    ...posts.map((p) => ({ url: abs(`/news/${encodeURIComponent(p.slug)}`), lastModified: p.updatedAt })),
    ...events.map((e) => ({ url: abs(`/events/${encodeURIComponent(e.slug)}`), lastModified: e.createdAt })),
    ...albums.map((a) => ({ url: abs(`/gallery/${encodeURIComponent(a.slug)}`), lastModified: a.createdAt })),
    ...pages.map((p) => ({ url: abs(`/p/${encodeURIComponent(p.slug)}`), lastModified: p.updatedAt })),
  ];
}
