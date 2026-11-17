import { prisma } from "./db";
import { audioSrc } from "./text";
import type { Track } from "@/components/audio-player";

/** Playable tracks, featured first. Tracks with no usable source are left out. */
export async function playlist(): Promise<Track[]> {
  const rows = await prisma.audioTrack.findMany({ orderBy: [{ featured: "desc" }, { sort: "asc" }, { createdAt: "desc" }] });
  return rows.flatMap((r) => {
    const src = audioSrc(r);
    return src ? [{ id: r.id, title: r.title, speaker: r.speaker, category: r.category, src }] : [];
  });
}

export const latestQuote = () => prisma.quote.findFirst({ orderBy: { createdAt: "desc" } });

export const publishedPosts = (take?: number) =>
  prisma.post.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" }, take });
