import Link from "next/link";
import { getUser } from "@/lib/auth";
import { firstAllowed, MODULE_HOME, MODULE_LABEL, type Module } from "@/lib/permissions";

export const metadata = { title: "ไม่มีสิทธิ์" };
const ACT: Record<string, string> = { view: "ดู", create: "เพิ่ม", edit: "แก้ไข", delete: "ลบ" };

export default async function Denied({ searchParams }: { searchParams: Promise<{ m?: string; a?: string }> }) {
  const u = await getUser();
  const { m, a } = await searchParams;
  const home = u && firstAllowed(u);
  return (
    <div className="max-w-lg rounded-lg border border-line bg-white p-6">
      <h1 className="text-xl">บัญชีนี้ยังไม่มีสิทธิ์{a ? ACT[a] ?? "" : ""}{m && m in MODULE_LABEL ? `ในส่วน “${MODULE_LABEL[m as Module]}”` : ""}</h1>
      <p className="mt-2 text-muted">ขอสิทธิ์เพิ่มได้จากเจ้าของระบบ (เมนู ผู้ใช้และสิทธิ์)</p>
      {home && <Link href={MODULE_HOME[home]} className="btn mt-4">กลับไปหน้าที่ใช้ได้</Link>}
    </div>
  );
}
