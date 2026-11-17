// Back-office sections and who may do what. OWNER can do everything; other roles start from DEFAULTS
// and the owner can override any account per section (Admin → ผู้ใช้และสิทธิ์).
export const MODULES = [
  "dashboard", "news", "events", "registrations", "schedule", "dhamma", "gallery", "faq", "pages", "messages", "settings", "users",
] as const;
export type Module = (typeof MODULES)[number];
export const ACTIONS = { view: "v", create: "c", edit: "e", delete: "d" } as const;
export type Action = keyof typeof ACTIONS;
export const ROLES = ["OWNER", "ADMIN", "EDITOR"] as const;

export const MODULE_LABEL: Record<Module, string> = {
  dashboard: "ภาพรวม", news: "ข่าวสาร", events: "กิจกรรม", registrations: "ผู้ลงทะเบียน", schedule: "ตารางกิจวัตร",
  dhamma: "เสียงธรรมและโอวาท", gallery: "คลังภาพ", faq: "คำถามที่พบบ่อย", pages: "หน้าเนื้อหา", messages: "ข้อความติดต่อ",
  settings: "ข้อมูลวัด", users: "ผู้ใช้และสิทธิ์",
};

const ALL = "vced";
const NONE = Object.fromEntries(MODULES.map((m) => [m, ""])) as Record<Module, string>;
const CONTENT = { news: ALL, events: ALL, schedule: ALL, dhamma: ALL, gallery: ALL, faq: ALL, pages: ALL };
const DEFAULTS: Record<string, Record<Module, string>> = {
  // Temple office: all content, sign-ups and messages; no temple settings or accounts.
  ADMIN: { ...NONE, ...CONTENT, dashboard: "v", registrations: ALL, messages: ALL },
  // Volunteer editor: writes news, uploads photos and audio; deletes nothing.
  EDITOR: { ...NONE, dashboard: "v", news: "vce", gallery: "vce", dhamma: "vce", events: "v" },
};

export type PermUser = { role: string; perms: string };

export function effectivePerms(u: PermUser): Record<Module, string> {
  if (u.role === "OWNER") return Object.fromEntries(MODULES.map((m) => [m, ALL])) as Record<Module, string>;
  let overrides: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(u.perms);
    if (parsed && typeof parsed === "object") overrides = parsed;
  } catch {}
  const base = DEFAULTS[u.role] ?? NONE;
  return Object.fromEntries(
    MODULES.map((m) => [m, typeof overrides[m] === "string" ? clean(overrides[m] as string) : base[m]]),
  ) as Record<Module, string>;
}

const clean = (s: string) => [...ALL].filter((c) => s.includes(c)).join("");

export function can(u: PermUser, m: Module, a: Action): boolean {
  return effectivePerms(u)[m].includes(ACTIONS[a]);
}

export const MODULE_HOME: Record<Module, string> = {
  dashboard: "/admin", news: "/admin/news", events: "/admin/events", registrations: "/admin/registrations", schedule: "/admin/schedule",
  dhamma: "/admin/dhamma", gallery: "/admin/gallery", faq: "/admin/faq", pages: "/admin/pages", messages: "/admin/messages",
  settings: "/admin/settings", users: "/admin/users",
};

export function firstAllowed(u: PermUser): Module | null {
  const p = effectivePerms(u);
  return MODULES.find((m) => p[m].includes("v")) ?? null;
}

/** A non-owner may only hand out rights they hold themselves. */
export function grantable(granter: PermUser, wanted: Record<string, string>): Record<Module, string> {
  const mine = effectivePerms(granter);
  return Object.fromEntries(MODULES.map((m) => [m, [...clean(wanted[m] ?? "")].filter((c) => mine[m].includes(c)).join("")])) as Record<Module, string>;
}
