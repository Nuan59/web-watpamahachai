import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { thDateTime } from "@/lib/dates";
import { TOPIC, label } from "@/lib/labels";
import { ConfirmSubmit } from "@/components/form";
import { Flash, Head, Pill, type SP } from "../_ui";
import { deleteMessage, toggleRead } from "./actions";

export const metadata = { title: "ข้อความติดต่อ" };

const contactLink = (c: string) => (/^[\d\s+-]{9,}$/.test(c) ? `tel:${c.replace(/[^\d+]/g, "")}` : /@.+\./.test(c) && !/\s/.test(c) ? `mailto:${c}` : null);

export default async function Messages({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("messages");
  const msgs = await prisma.message.findMany({ orderBy: [{ readAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }], take: 300 });
  return (
    <>
      <Head title="ข้อความติดต่อ" />
      <Flash sp={await searchParams} />
      <p className="mb-4 hint">ข้อความจากฟอร์ม “ส่งข้อความถึงวัด” ในหน้าติดต่อ ตอบกลับทางช่องทางที่ผู้ส่งให้ไว้</p>
      <ul className="space-y-3">
        {msgs.map((m) => {
          const href = contactLink(m.contact);
          return (
            <li key={m.id} className={`rounded-lg border bg-white p-4 ${m.readAt ? "border-line" : "border-brown"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p><span className="font-semibold">{m.name}</span> · {href ? <a href={href} className="text-brown underline">{m.contact}</a> : m.contact}</p>
                <span className="flex items-center gap-2 text-sm text-muted"><Pill tone={m.readAt ? "grey" : "warn"}>{m.readAt ? "อ่านแล้ว" : "ใหม่"}</Pill>{label(TOPIC, m.topic)} · {thDateTime(m.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line">{m.body}</p>
              <div className="mt-3 flex gap-2">
                {can(u, "messages", "edit") && <form action={toggleRead}><input type="hidden" name="id" value={m.id} /><button className="btn btn-sm">{m.readAt ? "ทำเป็นยังไม่อ่าน" : "ทำเป็นอ่านแล้ว"}</button></form>}
                {can(u, "messages", "delete") && <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><ConfirmSubmit message="ลบข้อความนี้?">ลบ</ConfirmSubmit></form>}
              </div>
            </li>
          );
        })}
      </ul>
      {!msgs.length && <p className="text-muted">ยังไม่มีข้อความ</p>}
    </>
  );
}
