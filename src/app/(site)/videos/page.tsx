import { getSettings } from "@/lib/settings";
import { videoIds, youtubeEmbed } from "@/lib/media";
import { Empty, PageHead } from "@/components/site-ui";
import { YoutubeIcon } from "@/components/icons";

export const metadata = { title: "วิดีโอธรรมะ", description: "คลิปธรรมะและกิจกรรมของวัดป่ามหาไชย" };

export default async function Videos() {
  const s = await getSettings();
  const ids = videoIds(s.videos);
  return (
    <>
      <PageHead eyebrow="เสียงธรรม" title="วิดีโอธรรมะ" />
      <div className="wrap py-12">
        {!ids.length && <Empty>ยังไม่มีวิดีโอ</Empty>}
        <ul className="grid gap-6 md:grid-cols-2">
          {ids.map((id) => <li key={id} className="video-box"><iframe src={youtubeEmbed(id)} title="วิดีโอธรรมะ" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></li>)}
        </ul>
        {s.youtube && <p className="mt-8 text-center"><a href={s.youtube} target="_blank" rel="noopener" className="btn btn-primary"><YoutubeIcon className="h-5 w-5" /> ดูทั้งหมดที่ช่อง YouTube ของวัด</a></p>}
      </div>
    </>
  );
}
