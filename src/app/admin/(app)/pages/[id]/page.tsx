import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ConfirmSubmit } from "@/components/form";
import { Flash, Head, type SP } from "../../_ui";
import { PageForm } from "../form";
import { deletePage } from "../actions";

export const metadata = { title: "แก้ไขหน้า" };

export default async function EditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const u = await requirePerm("pages", "edit");
  const p = await prisma.page.findUnique({ where: { id: (await params).id } });
  if (!p) notFound();
  return (
    <>
      <Head title={p.title} crumbs={[["หน้าเนื้อหา", "/admin/pages"], ["แก้ไข"]]} actions={<>
        {p.published && <Link href={`/p/${p.slug}`} target="_blank" className="btn btn-sm">ดูบนเว็บ ↗</Link>}
        {can(u, "pages", "delete") && <form action={deletePage}><input type="hidden" name="id" value={p.id} /><ConfirmSubmit message={`ลบหน้า “${p.title}”?`}>ลบหน้า</ConfirmSubmit></form>}
      </>} />
      <Flash sp={await searchParams} />
      <PageForm p={p} />
    </>
  );
}
