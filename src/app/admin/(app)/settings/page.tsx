import Image from "next/image";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getSettings, MUST_CONFIRM, type SettingKey } from "@/lib/settings";
import { fileUrl } from "@/lib/storage";
import { Submit } from "@/components/form";
import { Check, Flash, Head, Panel, type SP } from "../_ui";
import { saveTempleSettings } from "./actions";

export const metadata = { title: "ข้อมูลวัด" };

export default async function SettingsPage({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("settings");
  const s = await getSettings();
  const ro = !can(u, "settings", "edit");
  const need = (k: SettingKey) => MUST_CONFIRM.includes(k) && !s[k];
  const F = ({ k, label, hint, area }: { k: SettingKey; label: string; hint?: string; area?: number }) => (
    <label className="block">
      <span className="label">{label}{need(k) && <span className="ml-2 rounded bg-warn-tint px-1.5 text-xs text-warn">ยังไม่ได้กรอก</span>}</span>
      {area ? <textarea name={k} rows={area} defaultValue={s[k]} disabled={ro} className="input" /> : <input name={k} defaultValue={s[k]} disabled={ro} className="input" />}
      {hint && <span className="hint mt-1 block">{hint}</span>}
    </label>
  );
  const Img = ({ k, label }: { k: "abbotPhoto" | "donateQr"; label: string }) => (
    <div>
      <span className="label">{label}{need(k) && <span className="ml-2 rounded bg-warn-tint px-1.5 text-xs text-warn">ยังไม่ได้ใส่</span>}</span>
      {s[k] && <Image src={fileUrl(s[k])!} alt="" width={160} height={160} className="mb-2 h-40 w-40 rounded-md border border-line object-cover" />}
      {!ro && <input name={k} type="file" accept="image/jpeg,image/png,image/webp" className="block text-sm" />}
      {!ro && s[k] && <Check name={`remove_${k}`} label="ลบรูปนี้" />}
    </div>
  );
  return (
    <>
      <Head title="ข้อมูลวัด" />
      <Flash sp={await searchParams} />
      <form action={saveTempleSettings} className="grid gap-5 xl:grid-cols-2">
        <Panel title="ชื่อและคติธรรม"><div className="space-y-3"><F k="templeName" label="ชื่อวัด" /><F k="tagline" label="คำบรรยายใต้ชื่อ" /><F k="motto" label="คติธรรม (แสดงเมื่อยังไม่มีโอวาท)" /><F k="mottoBy" label="ผู้ให้คติธรรม" /></div></Panel>
        <Panel title="ติดต่อ"><div className="space-y-3"><F k="address" label="ที่อยู่" /><div className="grid gap-3 sm:grid-cols-2"><F k="phone" label="โทรศัพท์" /><F k="email" label="อีเมล" /><F k="lineId" label="LINE ID" /><F k="hours" label="เวลาเปิดให้เข้ากราบพระ" hint="เช่น ทุกวัน 05:00–20:00 น." /></div><F k="facebook" label="ลิงก์เพจ Facebook" /><F k="youtube" label="ลิงก์ช่อง YouTube" hint="เช่น https://www.youtube.com/channel/…" /><F k="libraryUrl" label="ลิงก์ห้องสมุดธรรมะออนไลน์" /></div></Panel>
        <Panel title="ประวัติวัดและเจ้าอาวาส"><div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><F k="abbotTitle" label="สมณศักดิ์เจ้าอาวาส" /><F k="abbotName" label="ชื่อและฉายาเจ้าอาวาส" /></div><F k="abbotRole" label="ตำแหน่ง / ระยะเวลา" /><F k="history" label="ประวัติวัด" hint="เว้นบรรทัดเพื่อขึ้นย่อหน้าใหม่" area={9} /><Img k="abbotPhoto" label="รูปเจ้าอาวาส" /></div></Panel>
        <Panel title="ร่วมทำบุญ"><div className="space-y-3"><F k="bankName" label="ธนาคาร" /><F k="bankAccount" label="เลขที่บัญชี" /><F k="bankAccountName" label="ชื่อบัญชี" /><p className="hint">ถ้ายังไม่กรอก หน้า “ร่วมทำบุญ” จะให้โทรสอบถามเลขบัญชีกับทางวัด</p><Img k="donateQr" label="คิวอาร์โค้ดพร้อมเพย์ (ถ้ามี)" /></div></Panel>
        <Panel title="วิทยุ วิดีโอ และประกาศหน้าแรก"><div className="space-y-3"><F k="almsText" label="ข้อความบิณฑบาตที่หน้าแรก" hint="เว้นว่าง = ไม่แสดง" /><F k="radioUrl" label="ลิงก์สตรีมวิทยุออนไลน์" hint="ลิงก์เสียงสด เช่น https://…/stream หรือ …/live.m3u8 เว้นว่าง = ไม่แสดงวิทยุ" /><F k="radioName" label="ชื่อสถานีวิทยุ" /><F k="videos" label="วิดีโอ YouTube (หนึ่งลิงก์ต่อหนึ่งบรรทัด ใหม่สุดไว้บน)" hint="แสดงที่หน้าแรกและหน้า “วิดีโอธรรมะ”" area={5} /></div></Panel>
        <Panel title="แผนที่และการเดินทาง" className="xl:col-span-2"><div className="grid gap-3 lg:grid-cols-3"><F k="mapsQuery" label="คำค้นใน Google Maps" hint="ชื่อสถานที่หรือพิกัด เช่น 13.5,100.2" /><F k="travelCar" label="มาด้วยรถยนต์" area={3} /><F k="travelPublic" label="มาด้วยรถโดยสาร" area={3} /></div></Panel>
        {!ro && <div className="xl:col-span-2"><Submit>บันทึกข้อมูลวัด</Submit></div>}
      </form>
    </>
  );
}
