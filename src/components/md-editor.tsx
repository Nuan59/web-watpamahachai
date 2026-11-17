"use client";
import { useState } from "react";
import { renderMarkdown } from "@/lib/text";

/** Markdown textarea with a preview tab and a short cheat sheet. */
export function MdEditor({ name, defaultValue = "", rows = 14, label = "เนื้อหา" }: { name: string; defaultValue?: string; rows?: number; label?: string }) {
  const [v, setV] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const btn = (t: typeof tab, l: string) => (
    <button type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className="cursor-pointer rounded-t-md border border-b-0 border-line px-3 py-1 text-sm aria-pressed:bg-white aria-pressed:font-semibold aria-[pressed=false]:bg-cream aria-[pressed=false]:text-muted">{l}</button>
  );
  return (
    <div>
      <div className="flex items-end justify-between">
        <span className="label">{label}</span>
        <div className="flex gap-1">{btn("write", "เขียน")}{btn("preview", "ดูตัวอย่าง")}</div>
      </div>
      <textarea name={name} value={v} onChange={(e) => setV(e.target.value)} rows={rows} className={`input font-mono text-sm leading-6 ${tab === "write" ? "" : "hidden"}`} />
      {tab === "preview" && <div className="prose-wat min-h-40 rounded-md border border-line bg-white p-4" dangerouslySetInnerHTML={{ __html: v ? renderMarkdown(v) : "<p class='text-grey'>ยังไม่มีเนื้อหา</p>" }} />}
      <p className="hint mt-1">ขึ้นหัวข้อด้วย <code>## </code> · ตัวหนา <code>**ข้อความ**</code> · รายการ <code>- </code> · ลิงก์ <code>[ข้อความ](https://…)</code> · ใส่รูป <code>![คำอธิบาย](ลิงก์รูป)</code></p>
    </div>
  );
}
