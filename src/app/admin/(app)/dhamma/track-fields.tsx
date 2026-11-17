import { Check, Field } from "../_ui";

export function TrackFields({ t, series }: { t?: { title: string; speaker: string; category: string; url: string; featured: boolean; sort: number; fileKey: string | null; seriesId: string | null; downloadable: boolean }; series: { id: string; title: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="ชื่อเรื่อง" className="sm:col-span-2"><input name="title" required defaultValue={t?.title} className="input" /></Field>
      <Field label="ผู้แสดงธรรม"><input name="speaker" defaultValue={t?.speaker} className="input" /></Field>
      <Field label="หมวด" hint="เช่น ธรรมบรรยาย, บทสวดมนต์, นำนั่งสมาธิ"><input name="category" list="audio-cats" defaultValue={t?.category ?? "ธรรมบรรยาย"} className="input" /></Field>
      <Field label={t?.fileKey ? "เปลี่ยนไฟล์เสียง" : "ไฟล์เสียง"} hint="MP3/M4A ไม่เกิน 80 MB"><input name="file" type="file" accept="audio/*" className="block w-full text-sm" /></Field>
      <Field label="หรือ ลิงก์ Google Drive / ลิงก์ไฟล์เสียง" hint="ไฟล์ใน Drive ต้องแชร์แบบ “ทุกคนที่มีลิงก์”"><input name="url" defaultValue={t?.url} className="input" /></Field>
      <Field label="ลำดับ" hint="เลขน้อยขึ้นก่อน"><input name="sort" type="number" defaultValue={t?.sort ?? 0} className="input" /></Field>
      <Field label="อยู่ในชุด"><select name="seriesId" defaultValue={t?.seriesId ?? ""} className="input"><option value="">ไม่อยู่ในชุด (เสียงธรรมอื่น ๆ)</option>{series.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select></Field>
      <div className="self-end"><Check name="featured" label="ให้เล่นเป็นเรื่องแรกที่หน้าแรก" defaultChecked={t?.featured} /></div>
      <div className="self-end"><Check name="downloadable" label="ให้ดาวน์โหลดได้" defaultChecked={t?.downloadable ?? true} /></div>
    </div>
  );
}
