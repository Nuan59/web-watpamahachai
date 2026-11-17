import { prisma } from "./db";
import { getSettings } from "./settings";
import { videoIds } from "./media";
import type { NavData } from "./nav";

/** Everything the public menu needs, in one round of queries. */
export async function navData(): Promise<NavData & { settings: Awaited<ReturnType<typeof getSettings>> }> {
  const [settings, pages, series, cats, monks] = await Promise.all([
    getSettings(),
    prisma.page.findMany({ where: { published: true, navGroup: { not: "" } }, orderBy: [{ sort: "asc" }, { title: "asc" }], select: { slug: true, title: true, navGroup: true } }),
    prisma.audioSeries.findMany({ where: { published: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }], select: { slug: true, title: true } }),
    prisma.libraryDoc.groupBy({ by: ["category"], _min: { sort: true }, orderBy: { _min: { sort: "asc" } } }),
    prisma.monk.count({ where: { published: true } }),
  ]);
  return {
    settings, pages, series, docCategories: cats.map((c) => c.category), libraryUrl: settings.libraryUrl,
    hasMonks: monks > 0, hasVideos: videoIds(settings.videos).length > 0,
  };
}
