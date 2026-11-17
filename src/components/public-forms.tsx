"use client";
import { useActionState } from "react";
import { registerForEvent, sendMessage, type FormState } from "@/lib/public-actions";
import { TOPIC } from "@/lib/labels";
import { Submit } from "./form";

const Honeypot = () => (
  <label aria-hidden className="absolute -left-[9999px]">เว็บไซต์<input name="website" tabIndex={-1} autoComplete="off" /></label>
);

export function SignupForm({ eventId, seatsLeft }: { eventId: string; seatsLeft: number | null }) {
  const [st, act] = useActionState<FormState, FormData>(registerForEvent, undefined);
  if (st?.ok) return (
    <div role="status" className="rounded-lg border border-ok/30 bg-ok-tint p-5 text-ok">
      <p className="font-semibold">ลงทะเบียนเรียบร้อย อนุโมทนาบุญ 🙏</p>
      <p className="mt-1 text-sm">ทางวัดจะติดต่อกลับทางโทรศัพท์เพื่อยืนยัน หากไม่ได้รับการติดต่อภายใน ๓ วัน โทรสอบถามได้ที่วัด</p>
    </div>
  );
  const v = st?.values ?? {};
  return (
    <form key={JSON.stringify(v)} action={act} className="relative space-y-4">
      <Honeypot />
      <input type="hidden" name="eventId" value={eventId} />
      {st?.error && <p role="alert" className="rounded-md border border-bad/40 bg-white px-3 py-2 text-sm text-bad">{st.error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">ชื่อ-นามสกุล *</span><input name="name" required maxLength={120} autoComplete="name" defaultValue={v.name} className="input" /></label>
        <label className="block"><span className="label">เบอร์โทร *</span><input name="phone" required inputMode="tel" autoComplete="tel" placeholder="081-234-5678" defaultValue={v.phone} className="input" /></label>
        <label className="block"><span className="label">อายุ</span><input name="age" type="number" min={1} max={119} inputMode="numeric" defaultValue={v.age} className="input" /></label>
        <label className="block"><span className="label">เพศ</span>
          <select name="gender" defaultValue={v.gender ?? ""} className="input"><option value="">ไม่ระบุ</option><option value="MALE">ชาย</option><option value="FEMALE">หญิง</option></select>
        </label>
        <label className="block"><span className="label">จำนวนคน (รวมตัวเอง)</span><input name="people" type="number" min={1} max={seatsLeft ? Math.min(20, seatsLeft) : 20} defaultValue={v.people ?? 1} className="input" /></label>
      </div>
      <label className="block"><span className="label">หมายเหตุ</span><textarea name="note" rows={3} maxLength={1000} defaultValue={v.note} placeholder="เช่น โรคประจำตัว อาหารที่แพ้ หรือชื่อผู้มาด้วย" className="input" /></label>
      <p className="hint">ข้อมูลนี้ใช้เพื่อติดต่อเรื่องกิจกรรมนี้เท่านั้น เห็นได้เฉพาะเจ้าหน้าที่วัด</p>
      <Submit pendingText="กำลังส่ง…">ลงทะเบียน</Submit>
    </form>
  );
}

export function ContactForm() {
  const [st, act] = useActionState<FormState, FormData>(sendMessage, undefined);
  if (st?.ok) return <p role="status" className="rounded-lg border border-ok/30 bg-ok-tint p-5 text-ok">ส่งข้อความถึงวัดแล้ว ทางวัดจะติดต่อกลับโดยเร็ว 🙏</p>;
  const v = st?.values ?? {};
  return (
    <form key={JSON.stringify(v)} action={act} className="relative space-y-4">
      <Honeypot />
      {st?.error && <p role="alert" className="rounded-md border border-bad/40 bg-white px-3 py-2 text-sm text-bad">{st.error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="label">ชื่อ *</span><input name="name" required maxLength={120} autoComplete="name" defaultValue={v.name} className="input" /></label>
        <label className="block"><span className="label">เบอร์โทร / LINE / อีเมล *</span><input name="contact" required maxLength={200} defaultValue={v.contact} className="input" /></label>
      </div>
      <label className="block"><span className="label">เรื่อง</span>
        <select name="topic" defaultValue={v.topic} className="input">{Object.entries(TOPIC).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </label>
      <label className="block"><span className="label">ข้อความ *</span><textarea name="body" required rows={5} maxLength={3000} defaultValue={v.body} className="input" /></label>
      <Submit pendingText="กำลังส่ง…">ส่งข้อความ</Submit>
    </form>
  );
}
