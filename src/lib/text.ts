import { marked } from "marked";
import { youtubeEmbed, youtubeId } from "./media";

/** URL slug that keeps Thai letters: "ทอดกฐิน 2569!" → "ทอดกฐิน-2569". */
export function slugify(s: string) {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "page";
}

/** Google Drive file id from a share link, an open?id= link or a bare id. */
export function driveId(link: string | null | undefined): string | null {
  if (!link) return null;
  const m = link.match(/\/file\/d\/([\w-]{20,})/) ?? link.match(/[?&]id=([\w-]{20,})/);
  if (m) return m[1];
  return /^[\w-]{20,}$/.test(link.trim()) ? link.trim() : null;
}

/** Playable source for an audio track: uploaded file, Drive link, or a direct URL. */
export function audioSrc(t: { fileKey: string | null; url: string }): string | null {
  if (t.fileKey) return `/files/${t.fileKey}`;
  const id = driveId(t.url);
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  return /^https?:\/\//.test(t.url) ? t.url : null;
}

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

/**
 * Markdown → HTML for content written in the back office. Raw HTML is escaped (not rendered) and
 * links/images may only use http(s), mailto, tel or site-relative URLs.
 */
export function renderMarkdown(md: string): string {
  const safeUrl = (u: string) => (/^(https?:|mailto:|tel:|\/(?!\/)|#)/i.test(u.trim()) ? u : "#");
  const renderer = new marked.Renderer();
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.link = function ({ href, title, tokens }) {
    const inner = this.parser.parseInline(tokens);
    const ext = /^https?:/i.test(href);
    return `<a href="${escapeHtml(safeUrl(href))}"${title ? ` title="${escapeHtml(title)}"` : ""}${ext ? ' target="_blank" rel="noopener"' : ""}>${inner}</a>`;
  };
  // A paragraph that is just a YouTube link becomes an embedded player.
  const para = renderer.paragraph.bind(renderer);
  renderer.paragraph = function (tok) {
    const only = tok.tokens.length === 1 ? tok.tokens[0] : null;
    const href = only && (only.type === "link" || only.type === "text") ? ("href" in only ? (only.href as string) : only.raw) : "";
    const id = href ? youtubeId(href) : null;
    if (id) return `<div class="video"><iframe src="${youtubeEmbed(id)}" title="วิดีโอ YouTube" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>\n`;
    return para(tok);
  };
  renderer.image = ({ href, title, text }) =>
    `<img src="${escapeHtml(safeUrl(href))}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ""} loading="lazy">`;
  return marked.parse(md, { renderer, async: false, gfm: true, breaks: true }) as string;
}

/** Plain-text summary for meta descriptions and cards. */
export function plainExcerpt(md: string, max = 160) {
  const t = md.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[#>*_`~|-]+/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}
