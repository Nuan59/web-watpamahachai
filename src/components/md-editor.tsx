"use client";
import { useRef, useState } from "react";
import { renderMarkdown } from "@/lib/text";
import { uploadContentImage } from "@/app/admin/(app)/media/actions";

/** Markdown textarea with a preview tab, a picture upload button and a short cheat sheet. */
export function MdEditor({ name, defaultValue = "", rows = 14, label = "เนื้อหา", imagesFor }: { name: string; defaultValue?: string; rows?: number; label?: string; imagesFor?: "news" | "events" | "pages" }) {
  const [v, setV] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);
  const pick = useRef<HTMLInputElement>(null);

  const insert = (text: string) => {
    const el = ta.current;
    const at = el ? el.selectionStart : v.length;
    const next = `${v.slice(0, at)}${text}${v.slice(at)}`;
    setV(next);
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(at + text.length, at + text.length); });
  };
  const upload = async (files: FileList | null) => {
    if (!files?.length || !imagesFor) return;
    setBusy(true); setErr("");
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", f);
      const r = await uploadContentImage(imagesFor, fd);
      if (r.url) insert(`\n\n![${f.name.replace(/\.[^.]+$/, "")}](${r.url})\n\n`);
      else setErr(r.error ?? "อัปโหลดรูปไม่สำเร็จ");
    }
    setBusy(false);
    if (pick.current) pick.current.value = "";
  };
  const btn = (t: typeof tab, l: string) => (
    <button type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className="cursor-pointer rounded-t-md border border-b-0 border-line px-3 py-1 text-sm aria-pressed:bg-white aria-pressed:font-semibold aria-[pressed=false]:bg-cream aria-[pressed=false]:text-muted">{l}</button>
  );
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="label">{label}</span>
        <div className="flex gap-1">
          {imagesFor && tab === "write" && (
            <>
              <input ref={pick} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => upload(e.target.files)} aria-label="เลือกรูปที่จะแทรก" />
              <button type="button" disabled={busy} onClick={() => pick.current?.click()} className="cursor-pointer rounded-t-md border border-b-0 border-line bg-cream px-3 py-1 text-sm text-brown-dark">{busy ? "กำลังอัปโหลด…" : "🖼 แทรกรูป"}</button>
            </>
          )}
          {btn("write", "เขียน")}{btn("preview", "ดูตัวอย่าง")}
        </div>
      </div>
      <textarea ref={ta} name={name} value={v} onChange={(e) => setV(e.target.value)} rows={rows} className={`input font-mono text-sm leading-6 ${tab === "write" ? "" : "hidden"}`} />
      {tab === "preview" && <div className="prose-wat min-h-40 rounded-md border border-line bg-white p-4" dangerouslySetInnerHTML={{ __html: v ? renderMarkdown(v) : "<p class='text-grey'>ยังไม่มีเนื้อหา</p>" }} />}
      {err && <p role="alert" className="mt-1 text-sm text-bad">{err}</p>}
      <p className="hint mt-1">หัวข้อ <code>## </code> · ตัวหนา <code>**ข้อความ**</code> · รายการ <code>- </code> · ลิงก์ <code>[ข้อความ](https://…)</code> · วางลิงก์ YouTube ไว้บรรทัดเดียวเพื่อแสดงวิดีโอ{imagesFor && " · กด “แทรกรูป” เพื่อใส่รูปตรงตำแหน่งเคอร์เซอร์"}</p>
    </div>
  );
}
