import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "./db";
import { readSession, signSession } from "./session";
import { can, type Action, type Module } from "./permissions";

export const COOKIE = "wpm_session";
const TTL = 60 * 60 * 12;

export const getUser = cache(async () => {
  const uid = await readSession((await cookies()).get(COOKIE)?.value);
  if (!uid) return null;
  const u = await prisma.user.findUnique({ where: { id: uid } });
  return u?.active ? u : null;
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

/** Every back-office page and server action calls this first (see rbac-coverage.test.ts). */
export async function requirePerm(m: Module, a: Action = "view"): Promise<SessionUser> {
  const u = await getUser();
  if (!u) redirect("/admin/login");
  if (!can(u, m, a)) redirect(`/admin/denied?m=${m}&a=${a}`);
  return u;
}

export async function startSession(userId: string) {
  (await cookies()).set(COOKIE, await signSession(userId, TTL), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIE !== "1", path: "/", maxAge: TTL,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
