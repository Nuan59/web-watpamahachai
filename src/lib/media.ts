/** YouTube video id from watch / youtu.be / embed / shorts / live links, or null. */
export function youtubeId(raw: string): string | null {
  const s = raw.trim();
  const m =
    s.match(/^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)([\w-]{11})/) ??
    s.match(/^https?:\/\/youtu\.be\/([\w-]{11})/);
  return m ? m[1] : null;
}

export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;

/** One YouTube link per line → ids, duplicates and junk dropped. */
export function videoIds(lines: string): string[] {
  return [...new Set(lines.split(/\r?\n/).map(youtubeId).filter((x): x is string => !!x))];
}

/** Safe file name for a download: keeps Thai, letters, digits, spaces, dashes. */
export function downloadName(title: string, ext: string) {
  const base = title.normalize("NFC").replace(/[^\p{L}\p{M}\p{N} ._-]+/gu, " ").replace(/\s+/g, " ").trim().slice(0, 120) || "file";
  return `${base}.${ext}`;
}

/** Content-Disposition header that works for Thai names in every browser. */
export function attachment(name: string) {
  const ascii = name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/** Kind of live stream from its address. */
export const streamKind = (url: string): "hls" | "direct" | null =>
  !/^https?:\/\//.test(url.trim()) ? null : /\.m3u8(\?|$)/i.test(url) ? "hls" : "direct";
