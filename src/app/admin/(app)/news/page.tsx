import Link from "next/link";
import { requirePerm } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { thDate } from "@/lib/dates";
import { Flash, Head, Panel, Pill, TableWrap, type SP } from "../_ui";

export const metadata = { title: "ข่าวสาร" };

export default async function NewsAdmin({ searchParams }: { searchParams: SP }) {
  const u = await requirePerm("news");
  const posts = await prisma.post.findMany({ orderBy: [{ updatedAt: "desc" }], include: { author: { select: { name: true } } } });
  return (
    <>
      <Head title="ข่าวสาร" actions={can(u, "news", "create") && <Link href="/admin/news/new" className="btn btn-primary btn-sm">+ เขียนข่าว</Link>} />
      <Flash sp={await searchParams} />
      <Panel>
        {posts.length ? (
          <TableWrap>
            <table className="tbl">
              <thead><tr><th>หัวข้อ</th><th>สถานะ</th><th>วันที่เผยแพร่</th><th>ผู้เขียน</th></tr></thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td><Link href={`/admin/news/${p.id}`} className="font-medium underline-offset-2 hover:underline">{p.title}</Link></td>
                    <td>{p.status === "PUBLISHED" ? <Pill tone="ok">เผยแพร่</Pill> : <Pill>ฉบับร่าง</Pill>}</td>
                    <td className="whitespace-nowrap">{p.publishedAt ? thDate(p.publishedAt) : "—"}</td>
                    <td>{p.author?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : <p className="text-muted">ยังไม่มีข่าว เริ่มเขียนข่าวแรกได้เลย</p>}
      </Panel>
    </>
  );
}
