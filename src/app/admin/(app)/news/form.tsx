import Image from "next/image";
import { fileUrl } from "@/lib/storage";
import { MdEditor } from "@/components/md-editor";
import { ActionForm, Submit } from "@/components/form";
import { Check, Field, Panel } from "../_ui";
import { savePost } from "./actions";

type Post = { id: string; title: string; slug: string; excerpt: string; body: string; coverKey: string | null; status: string };

export function PostForm({ p }: { p?: Post }) {
  const cover = fileUrl(p?.coverKey);
  return (
    <ActionForm action={savePost} className="grid gap-5 xl:grid-cols-[1fr_320px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <Panel>
        <div className="space-y-4">
          <Field label="หัวข้อข่าว"><input name="title" required defaultValue={p?.title} className="input text-lg" /></Field>
          <Field label="คำโปรย" hint="ข้อความสั้น ๆ ใต้หัวข้อ และที่แสดงตอนแชร์ลิงก์ เว้นว่างได้ ระบบจะตัดจากเนื้อหาให้"><textarea name="excerpt" rows={2} defaultValue={p?.excerpt} className="input" /></Field>
          <MdEditor name="body" defaultValue={p?.body} rows={18} imagesFor="news" />
        </div>
      </Panel>
      <div className="space-y-5">
        <Panel title="เผยแพร่">
          <div className="space-y-3">
            <Field label="สถานะ">
              <select name="status" defaultValue={p?.status ?? "DRAFT"} className="input"><option value="DRAFT">ฉบับร่าง (ยังไม่แสดง)</option><option value="PUBLISHED">เผยแพร่บนเว็บ</option></select>
            </Field>
            <Field label="ลิงก์" hint="เว้นว่างได้ ระบบตั้งจากหัวข้อ"><input name="slug" defaultValue={p?.slug} className="input" /></Field>
            <Submit className="btn btn-primary w-full">บันทึก</Submit>
          </div>
        </Panel>
        <Panel title="รูปหน้าปก">
          {cover && <Image src={cover} alt="" width={320} height={200} className="mb-3 aspect-[16/10] w-full rounded-md object-cover" />}
          <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm" />
          <p className="hint mt-1">JPG, PNG หรือ WEBP ไม่เกิน 10 MB</p>
          {cover && <div className="mt-2"><Check name="removeCover" label="ลบรูปปก" /></div>}
        </Panel>
      </div>
    </ActionForm>
  );
}
