import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "./db";
import { homeSlides, latestPhotos, safeLink } from "./slides";

describe("safeLink", () => {
  it("keeps site paths and https links, drops the rest", () => {
    expect(safeLink(" /events ")).toBe("/events");
    expect(safeLink("https://www.facebook.com/Watpamahachai/")).toBe("https://www.facebook.com/Watpamahachai/");
    expect(safeLink("//evil.test")).toBe("");
    expect(safeLink("javascript:alert(1)")).toBe("");
    expect(safeLink("http://plain.test")).toBe("");
    expect(safeLink("")).toBe("");
  });
});

describe("home slides and photos", () => {
  beforeEach(async () => {
    await prisma.homeSlide.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.album.deleteMany();
  });
  it("shows only active slides, in order, with safe links", async () => {
    await prisma.homeSlide.createMany({ data: [
      { imageKey: "public/home/b.webp", title: "B", sort: 2, linkUrl: "javascript:x" },
      { imageKey: "public/home/a.webp", title: "A", sort: 1, linkUrl: "/events" },
      { imageKey: "public/home/c.webp", title: "C", sort: 0, active: false },
    ] });
    const s = await homeSlides();
    expect(s.map((x) => x.title)).toEqual(["A", "B"]);
    expect(s[0]).toMatchObject({ src: "/files/public/home/a.webp", href: "/events" });
    expect(s[1].href).toBe("");
  });
  it("latest photos skip hidden albums and fall back to the album title", async () => {
    const open = await prisma.album.create({ data: { slug: "open", title: "งานบุญ" } });
    const hidden = await prisma.album.create({ data: { slug: "hidden", title: "ซ่อน", published: false } });
    await prisma.photo.create({ data: { albumId: open.id, key: "public/gallery/1.jpg" } });
    await prisma.photo.create({ data: { albumId: hidden.id, key: "public/gallery/2.jpg" } });
    const ps = await latestPhotos();
    expect(ps).toHaveLength(1);
    expect(ps[0]).toMatchObject({ caption: "งานบุญ", href: "/gallery/open" });
  });
});
