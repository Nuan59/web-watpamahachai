import type { NavItem } from "@/components/site-nav";

/** Menu groups an admin can put a content page under (Admin → หน้าเนื้อหา). Same groups as the old website. */
export const NAV_GROUPS = ["ประวัติ", "ปฏิบัติธรรม", "เสียงธรรม", "ห้องสมุด", "กิจกรรม"] as const;
const LEGACY: Record<string, string> = { "เกี่ยวกับวัด": "ประวัติ" };

export type NavData = {
  pages: { slug: string; title: string; navGroup: string }[];
  series: { slug: string; title: string }[];
  docCategories: string[];
  libraryUrl: string;
  hasMonks: boolean;
  hasVideos: boolean;
};

type Link = { href: string; label: string };

export function siteNav(d: NavData): NavItem[] {
  const pages = (g: string): Link[] => d.pages.filter((p) => (LEGACY[p.navGroup] ?? p.navGroup) === g).map((p) => ({ href: `/p/${p.slug}`, label: p.title }));
  const group = (href: string, label: string, children: Link[]): NavItem => ({ href, label, children });
  return [
    { href: "/", label: "หน้าแรก" },
    group("/about", "ประวัติ", [{ href: "/about", label: "ประวัติวัด" }, ...pages("ประวัติ"), ...(d.hasMonks ? [{ href: "/monks", label: "พระในสังกัด" }] : [])]),
    group("/practice", "ปฏิบัติธรรม", [
      { href: "/practice", label: "แนวทางปฏิบัติ" }, { href: "/schedule", label: "กิจวัตรประจำวัน" }, ...pages("ปฏิบัติธรรม"), { href: "/faq", label: "คำถามที่พบบ่อย" },
    ]),
    group("/dhamma", "เสียงธรรม", [
      ...d.series.map((s) => ({ href: `/dhamma/${s.slug}`, label: s.title })), ...pages("เสียงธรรม"),
      ...(d.hasVideos ? [{ href: "/videos", label: "วิดีโอธรรมะ" }] : []), { href: "/dhamma", label: "ฟังและดาวน์โหลดเสียงธรรม" },
    ]),
    group("/library", "ห้องสมุด", [
      ...d.docCategories.map((c) => ({ href: `/library?cat=${encodeURIComponent(c)}`, label: c })), ...pages("ห้องสมุด"),
      ...(d.libraryUrl ? [{ href: d.libraryUrl, label: "ห้องสมุดธรรมะออนไลน์ ↗" }] : []),
    ]),
    group("/events", "กิจกรรม", [
      { href: "/events", label: "กิจกรรมและลงทะเบียน" }, { href: "/news", label: "ข่าวประชาสัมพันธ์" }, { href: "/gallery", label: "คลังภาพ" }, ...pages("กิจกรรม"),
    ]),
    { href: "/donate", label: "ร่วมทำบุญ" },
    { href: "/contact", label: "ติดต่อ" },
  ];
}
