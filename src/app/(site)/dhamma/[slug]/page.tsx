import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { playlist } from "@/lib/queries";
import { fileUrl } from "@/lib/storage";
import { AudioPlayer } from "@/components/audio-player";
import { Empty } from "@/components/site-ui";

type P = { params: Promise<{ slug: string }> };
const find = (slug: string) => prisma.audioSeries.findFirst({ where: { slug: decodeURIComponent(slug), published: true } });

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const x = await find((await params).slug);
  return x ? { title: x.title, description: x.summary || `ฟังและดาวน์โหลด ${x.title}${x.speaker ? ` โดย ${x.speaker}` : ""}` } : {};
}

export default async function Series({ params }: P) {
  const x = await find((await params).slug);
  if (!x) notFound();
  const tracks = await playlist({ seriesId: x.id, inSeriesOrder: true });
  const zip = x.zipKey ? `${fileUrl(x.zipKey)}?dl=${encodeURIComponent(x.title)}` : x.zipUrl;
  return (
    <div className="wrap py-10">
      <p className="text-sm"><Link href="/dhamma" className="text-brown underline">‹ เสียงธรรมทั้งหมด</Link></p>
      <div className="mt-5 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-cream">
            {x.coverKey ? <Image src={fileUrl(x.coverKey)!} alt="" fill sizes="260px" className="object-cover" priority /> : <Image src="/logo.webp" alt="" fill sizes="260px" className="object-contain p-10 opacity-50" />}
          </div>
          {zip && <a href={zip} className="btn btn-primary mt-4 w-full" {...(x.zipKey ? {} : { target: "_blank", rel: "noopener" })}>⬇ ดาวน์โหลดทั้งชุด</a>}
        </div>
        <div className="min-w-0">
          <p className="eyebrow">ชุดเสียงธรรม</p>
          <h1 className="text-3xl sm:text-4xl">{x.title}</h1>
          {x.speaker && <p className="mt-1 text-brown">บรรยายโดย {x.speaker}</p>}
          {x.summary && <p className="mt-3 whitespace-pre-line text-muted">{x.summary}</p>}
          <div className="mt-6">{tracks.length ? <AudioPlayer tracks={tracks} showDownloads /> : <Empty>ชุดนี้ยังไม่มีไฟล์เสียง</Empty>}</div>
        </div>
      </div>
    </div>
  );
}
