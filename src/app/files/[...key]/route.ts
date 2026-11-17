import { CONTENT_TYPES, readUpload } from "@/lib/storage";

// Everything uploaded through the back office is public content (photos, covers, audio, QR).
// Only keys under public/ are ever served.
export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.map(decodeURIComponent).join("/");
  if (!key.startsWith("public/") || key.includes("..")) return new Response("Not found", { status: 404 });
  const data = await readUpload(key);
  if (!data) return new Response("Not found", { status: 404 });
  const ext = key.split(".").pop() ?? "";
  const type = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const headers: Record<string, string> = { "content-type": type, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff", "accept-ranges": "bytes" };
  // Audio players seek with Range requests.
  const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (range && type.startsWith("audio/")) {
    const size = data.length;
    const start = range[1] ? parseInt(range[1], 10) : Math.max(0, size - parseInt(range[2] || "0", 10));
    const end = range[1] && range[2] ? Math.min(parseInt(range[2], 10), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    return new Response(new Uint8Array(data.subarray(start, end + 1)), { status: 206, headers: { ...headers, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(end - start + 1) } });
  }
  return new Response(new Uint8Array(data), { headers: { ...headers, "content-length": String(data.length) } });
}
