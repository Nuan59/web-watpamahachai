import { requirePerm } from "@/lib/auth";
import { Flash, Head, type SP } from "../../_ui";
import { PageForm } from "../form";

export const metadata = { title: "สร้างหน้า" };

export default async function NewPage({ searchParams }: { searchParams: SP }) {
  await requirePerm("pages", "create");
  return <><Head title="สร้างหน้า" crumbs={[["หน้าเนื้อหา", "/admin/pages"], ["สร้าง"]]} /><Flash sp={await searchParams} /><PageForm /></>;
}
