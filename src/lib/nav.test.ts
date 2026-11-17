import { describe, expect, it } from "vitest";
import { siteNav } from "./nav";

const base = { pages: [], series: [], docCategories: [], libraryUrl: "", hasMonks: false, hasVideos: false };
const labels = (xs: { label: string }[] | undefined) => (xs ?? []).map((x) => x.label);

describe("siteNav", () => {
  it("has the old website's top menu", () => {
    expect(siteNav(base).map((i) => i.label)).toEqual(["หน้าแรก", "ประวัติ", "ปฏิบัติธรรม", "เสียงธรรม", "ห้องสมุด", "กิจกรรม", "ร่วมทำบุญ", "ติดต่อ"]);
  });
  it("puts content pages, series and categories under their menus", () => {
    const nav = siteNav({
      ...base, hasMonks: true, hasVideos: true, libraryUrl: "https://lib.test",
      pages: [{ slug: "abbot", title: "ประวัติเจ้าอาวาส", navGroup: "ประวัติ" }, { slug: "old", title: "หน้าเก่า", navGroup: "เกี่ยวกับวัด" }, { slug: "ord", title: "อุปสมบทหมู่", navGroup: "ปฏิบัติธรรม" }],
      series: [{ slug: "dhamma-profit", title: "ธรรมกำไรชีวิต" }],
      docCategories: ["หนังสือสวดมนต์", "เรียนนักธรรมและบาลี"],
    });
    const by = (l: string) => nav.find((i) => i.label === l)!.children;
    expect(labels(by("ประวัติ"))).toEqual(["ประวัติวัด", "ประวัติเจ้าอาวาส", "หน้าเก่า", "พระในสังกัด"]);
    expect(labels(by("ปฏิบัติธรรม"))).toContain("อุปสมบทหมู่");
    expect(labels(by("เสียงธรรม"))).toEqual(["ธรรมกำไรชีวิต", "วิดีโอธรรมะ", "ฟังและดาวน์โหลดเสียงธรรม"]);
    expect(by("ห้องสมุด")!.map((x) => x.href)).toEqual(["/library?cat=" + encodeURIComponent("หนังสือสวดมนต์"), "/library?cat=" + encodeURIComponent("เรียนนักธรรมและบาลี"), "https://lib.test"]);
  });
});
