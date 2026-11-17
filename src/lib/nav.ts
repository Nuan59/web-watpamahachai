import type { NavItem } from "@/components/site-nav";

/** Menu groups an admin can put a content page under (Admin → หน้าเนื้อหา). */
export const NAV_GROUPS = ["เกี่ยวกับวัด", "ปฏิบัติธรรม", "กิจกรรม", "เสียงธรรม"] as const;

export function siteNav(pages: { slug: string; title: string; navGroup: string }[]): NavItem[] {
  const extra = (g: string) => pages.filter((p) => p.navGroup === g).map((p) => ({ href: `/p/${p.slug}`, label: p.title }));
  const withExtra = (g: string, base: { href: string; label: string }[]) => {
    const all = [...base, ...extra(g)];
    return all.length ? all : undefined;
  };
  return [
    { href: "/", label: "หน้าแรก" },
    { href: "/about", label: "เกี่ยวกับวัด", children: withExtra("เกี่ยวกับวัด", []) },
    { href: "/practice", label: "ปฏิบัติธรรม", children: withExtra("ปฏิบัติธรรม", [{ href: "/schedule", label: "ตารางกิจวัตร" }, { href: "/faq", label: "คำถามที่พบบ่อย" }]) },
    { href: "/events", label: "กิจกรรม", children: withExtra("กิจกรรม", [{ href: "/news", label: "ข่าวสาร" }, { href: "/gallery", label: "คลังภาพ" }]) },
    { href: "/dhamma", label: "เสียงธรรม", children: withExtra("เสียงธรรม", []) },
    { href: "/donate", label: "ร่วมทำบุญ" },
    { href: "/contact", label: "ติดต่อ" },
  ];
}
