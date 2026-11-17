import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { ConfirmSubmit } from "@/components/form";
import { Flash, Head, type SP } from "../../_ui";
import { PostForm } from "../form";
import { deletePost } from "../actions";

export const metadata = { title: "แก้ไขข่าว" };

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const u = await requirePerm("news", "edit");
  const p = await prisma.post.findUnique({ where: { id: (await params).id } });
  if (!p) notFound();
  return (
    <>
      <Head
        title={p.title}
        crumbs={[["ข่าวสาร", "/admin/news"], ["แก้ไข"]]}
        actions={<>
          {p.status === "PUBLISHED" && <Link href={`/news/${p.slug}`} target="_blank" className="btn btn-sm">ดูบนเว็บ ↗</Link>}
          {can(u, "news", "delete") && <form action={deletePost}><input type="hidden" name="id" value={p.id} /><ConfirmSubmit message={`ลบข่าว “${p.title}”?`}>ลบข่าว</ConfirmSubmit></form>}
        </>}
      />
      <Flash sp={await searchParams} />
      <PostForm p={p} />
    </>
  );
}
