import { prisma } from "./db";
import { fileUrl } from "./storage";

/** A slide may link inside the site ("/events") or to an https page; anything else is dropped. */
export function safeLink(raw: string): string {
  const s = raw.trim();
  if (/^\/(?!\/)/.test(s)) return s;
  if (/^https:\/\/[^\s]+$/i.test(s)) return s;
  return "";
}

export type Slide = { id: string; src: string; title: string; caption: string; href: string };

export async function homeSlides(): Promise<Slide[]> {
  const rows = await prisma.homeSlide.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  return rows.map((r) => ({ id: r.id, src: fileUrl(r.imageKey)!, title: r.title, caption: r.caption, href: safeLink(r.linkUrl) }));
}

/** Newest photos across published albums, for the strip on the home page. */
export async function latestPhotos(take = 8) {
  const rows = await prisma.photo.findMany({
    where: { album: { published: true } },
    orderBy: [{ createdAt: "desc" }],
    take,
    include: { album: { select: { slug: true, title: true } } },
  });
  return rows.map((p) => ({ id: p.id, src: fileUrl(p.key)!, caption: p.caption || p.album.title, href: `/gallery/${p.album.slug}` }));
}
