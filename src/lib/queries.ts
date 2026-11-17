import { prisma } from "./db";
import { audioSrc } from "./text";
import type { Track } from "@/components/audio-player";

/**
 * Playable tracks. Default: every track, featured first (home page player). With seriesId: one series
 * (null = tracks in no series). Tracks with no usable source are left out; hidden series are skipped.
 */
export async function playlist(opts: { seriesId?: string | null; inSeriesOrder?: boolean } = {}): Promise<Track[]> {
  const rows = await prisma.audioTrack.findMany({
    where: opts.seriesId !== undefined ? { seriesId: opts.seriesId } : { OR: [{ seriesId: null }, { series: { published: true } }] },
    orderBy: opts.inSeriesOrder ? [{ sort: "asc" }, { createdAt: "asc" }] : [{ featured: "desc" }, { sort: "asc" }, { createdAt: "desc" }],
  });
  return rows.flatMap((r) => {
    const src = audioSrc(r);
    if (!src) return [];
    const download = !r.downloadable ? null : r.fileKey ? `/files/${r.fileKey}?dl=${encodeURIComponent(r.title)}` : src;
    return [{ id: r.id, title: r.title, speaker: r.speaker, category: r.category, src, download }];
  });
}

export const latestQuote = () => prisma.quote.findFirst({ orderBy: { createdAt: "desc" } });

export const publishedPosts = (take?: number) =>
  prisma.post.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, orderBy: { publishedAt: "desc" }, take });
