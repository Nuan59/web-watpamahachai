import { requirePerm } from "@/lib/auth";
import { Flash, Head, type SP } from "../../_ui";
import { PostForm } from "../form";

export const metadata = { title: "เขียนข่าว" };

export default async function NewPost({ searchParams }: { searchParams: SP }) {
  await requirePerm("news", "create");
  return (
    <>
      <Head title="เขียนข่าว" crumbs={[["ข่าวสาร", "/admin/news"], ["เขียนข่าว"]]} />
      <Flash sp={await searchParams} />
      <PostForm />
    </>
  );
}
