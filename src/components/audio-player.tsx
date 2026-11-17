"use client";
import { useEffect, useRef, useState } from "react";

export type Track = { id: string; title: string; speaker: string; category: string; src: string; download?: string | null };

const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

/** Plays the list one after another, like a radio. */
export function AudioPlayer({ tracks, compact = false, showDownloads = false }: { tracks: Track[]; compact?: boolean; showDownloads?: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [showList, setShowList] = useState(!compact);
  const [failed, setFailed] = useState(false);
  const cur = tracks[i];

  useEffect(() => {
    const a = ref.current;
    if (!a || !cur) return;
    setFailed(false);
    a.src = cur.src;
    if (playing) a.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, cur?.src]);

  if (!tracks.length) return <p className="rounded-lg border border-dashed border-line bg-white/70 px-4 py-6 text-center text-muted">ยังไม่มีเสียงธรรมในขณะนี้</p>;

  const toggle = () => {
    const a = ref.current!;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setFailed(true));
    else { a.pause(); setPlaying(false); }
  };
  const go = (n: number) => { setI((n + tracks.length) % tracks.length); setPlaying(true); };

  return (
    <div className="card p-4 sm:p-5">
      <audio
        ref={ref}
        preload="none"
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => go(i + 1)}
        onError={() => { setFailed(true); setPlaying(false); }}
      />
      <div className="flex items-center gap-4">
        <button type="button" onClick={toggle} aria-label={playing ? "หยุดชั่วคราว" : "เล่น"} className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full bg-brown text-xl text-white hover:bg-brown-dark">
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-grey">{cur.category}{cur.speaker && ` · ${cur.speaker}`}</p>
          <p className="truncate font-semibold">{cur.title}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-grey num">
            <span>{fmt(t)}</span>
            <input aria-label="ตำแหน่งที่เล่น" type="range" min={0} max={dur || 0} step={1} value={t} onChange={(e) => { if (ref.current) ref.current.currentTime = +e.target.value; }} className="h-1 flex-1 accent-[#744a24]" />
            <span>{fmt(dur)}</span>
          </div>
        </div>
        <button type="button" onClick={() => go(i + 1)} aria-label="เรื่องถัดไป" className="btn btn-sm hidden sm:inline-flex">ถัดไป ⏭</button>
      </div>
      {failed && <p className="mt-2 text-sm text-bad">เปิดไฟล์เสียงนี้ไม่ได้ ลองเรื่องถัดไป</p>}
      {(tracks.length > 1 || showDownloads) && (
        <>
          <button type="button" onClick={() => setShowList((v) => !v)} aria-expanded={showList} className="mt-3 w-full cursor-pointer text-center text-sm text-muted hover:text-brown">
            {showList ? "ซ่อนรายการ ▴" : `เลือกฟังเรื่องอื่น (${tracks.length} เรื่อง) ▾`}
          </button>
          {showList && (
            <ol className={`mt-2 overflow-y-auto border-t border-cream pt-2 ${showDownloads ? "" : "max-h-72"}`}>
              {tracks.map((x, n) => (
                <li key={x.id} className="flex items-center gap-1">
                  <button type="button" onClick={() => go(n)} aria-current={n === i ? "true" : undefined} className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-cream aria-[current=true]:bg-brown-tint aria-[current=true]:text-brown-dark">
                    <span className="w-5 text-grey num">{n + 1}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate">{x.title}</span><span className="text-xs text-grey">{x.category}{x.speaker && ` · ${x.speaker}`}</span></span>
                  </button>
                  {showDownloads && x.download && (
                    <a href={x.download} aria-label={`ดาวน์โหลด ${x.title}`} title="ดาวน์โหลด" className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-brown hover:bg-cream" {...(x.download.startsWith("/") ? {} : { target: "_blank", rel: "noopener" })}>⬇</a>
                  )}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
