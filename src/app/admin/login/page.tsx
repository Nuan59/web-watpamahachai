import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/session";
import { getUser, startSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { blocked, recordFailure } from "@/lib/ratelimit";
import { firstAllowed, MODULE_HOME } from "@/lib/permissions";
import { Submit } from "@/components/form";

export const metadata = { title: "เข้าสู่ระบบ" };

async function login(form: FormData) {
  "use server";
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // Only wrong passwords count: 10 per 10 minutes per address and per account.
  const keys = [`login:${ip}`, `login:${email}`];
  if (keys.some((k) => blocked(k, 10, 10 * 60_000))) redirect("/admin/login?error=rate");
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !u.active || !(await verifyPassword(String(form.get("password") ?? ""), u.passwordHash))) {
    keys.forEach((k) => recordFailure(k));
    redirect("/admin/login?error=1");
  }
  await startSession(u.id);
  await logActivity(u.id, "login", "user", u.id);
  const home = firstAllowed(u);
  redirect(home ? MODULE_HOME[home] : "/admin/denied");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await getUser();
  if (me) { const h = firstAllowed(me); redirect(h ? MODULE_HOME[h] : "/admin/denied"); }
  const { error } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-lg border border-line bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.webp" alt="" width={56} height={56} className="rounded-full" />
          <div>
            <h1 className="text-xl">ระบบหลังบ้าน วัดป่ามหาไชย</h1>
            <p className="hint">สำหรับเจ้าหน้าที่และผู้ดูแลเนื้อหา</p>
          </div>
        </div>
        {error && <p className="text-sm text-bad" role="alert">{error === "rate" ? "ลองเข้าสู่ระบบบ่อยเกินไป รอ ๑๐ นาทีแล้วลองใหม่" : "อีเมลหรือรหัสผ่านไม่ถูกต้อง ลองอีกครั้ง"}</p>}
        <label className="block"><span className="label">อีเมล</span><input name="email" type="email" required autoComplete="username" className="input" /></label>
        <label className="block"><span className="label">รหัสผ่าน</span><input name="password" type="password" required autoComplete="current-password" className="input" /></label>
        <Submit className="btn btn-primary w-full" pendingText="กำลังเข้าสู่ระบบ…">เข้าสู่ระบบ</Submit>
      </form>
    </main>
  );
}
