import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ConfirmSubmit } from "@/components/form";
import { Check, Flash, Head, Panel, type SP } from "../../_ui";
import { EventForm } from "../form";
import { deleteEvent } from "../actions";

export const metadata = { title: "แก้ไขกิจกรรม" };

export default async function EditEvent({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const u = await requirePerm("events", "edit");
  const e = await prisma.event.findUnique({ where: { id: (await params).id }, include: { _count: { select: { registrations: true } } } });
  if (!e) notFound();
  return (
    <>
      <Head
        title={e.title}
        crumbs={[["กิจกรรม", "/admin/events"], ["แก้ไข"]]}
        actions={<>
          {can(u, "registrations", "view") && <Link href={`/admin/registrations?event=${e.id}`} className="btn btn-sm">ผู้ลงทะเบียน ({e._count.registrations})</Link>}
          {e.published && <Link href={`/events/${e.slug}`} target="_blank" className="btn btn-sm">ดูบนเว็บ ↗</Link>}
        </>}
      />
      <Flash sp={await searchParams} />
      <EventForm e={e} />
      {can(u, "events", "delete") && (
        <Panel title="ลบกิจกรรม" className="mt-5 max-w-xl">
          <form action={deleteEvent} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={e.id} />
            {e._count.registrations > 0 && <Check name="withRegs" label={`ลบรายชื่อผู้ลงทะเบียน ${e._count.registrations} รายการด้วย`} />}
            <ConfirmSubmit message={`ลบกิจกรรม “${e.title}”? กู้คืนไม่ได้`}>ลบกิจกรรม</ConfirmSubmit>
          </form>
        </Panel>
      )}
    </>
  );
}
