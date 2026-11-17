import { requirePerm } from "@/lib/auth";
import { Flash, Head, type SP } from "../../_ui";
import { EventForm } from "../form";

export const metadata = { title: "เพิ่มกิจกรรม" };

export default async function NewEvent({ searchParams }: { searchParams: SP }) {
  await requirePerm("events", "create");
  return (
    <>
      <Head title="เพิ่มกิจกรรม" crumbs={[["กิจกรรม", "/admin/events"], ["เพิ่ม"]]} />
      <Flash sp={await searchParams} />
      <EventForm />
    </>
  );
}
