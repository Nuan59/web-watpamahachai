"use client";
import { useEffect, useRef, useState } from "react";

type State = "idle" | "loading" | "live" | "offline";

/** Live radio. Plays .mp3/.aac streams directly; .m3u8 (HLS) natively on Safari, else with hls.js. */
export function RadioPlayer({ url, name }: { url: string; name: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const hls = useRef<{ destroy(): void } | null>(null);
  const [st, setSt] = useState<State>("idle");
  useEffect(() => () => hls.current?.destroy(), []);

  const stop = () => {
    const a = ref.current!;
    a.pause();
    hls.current?.destroy();
    hls.current = null;
    a.removeAttribute("src");
    a.load();
    setSt("idle");
  };
  const play = async () => {
    const a = ref.current!;
    setSt("loading");
    try {
      if (/\.m3u8(\?|$)/i.test(url) && !a.canPlayType("application/vnd.apple.mpegurl")) {
        const { default: Hls } = await import("hls.js");
        if (!Hls.isSupported()) throw new Error("no hls");
        const h = new Hls();
        hls.current = h;
        h.on(Hls.Events.ERROR, (_e, d) => { if (d.fatal) { h.destroy(); setSt("offline"); } });
        h.loadSource(url);
        h.attachMedia(a);
      } else {
        a.src = url;
      }
      await a.play();
      setSt("live");
    } catch {
      setSt("offline");
    }
  };
  const label = { idle: "กดเพื่อฟัง", loading: "กำลังเชื่อมต่อ…", live: "กำลังออกอากาศ", offline: "ขณะนี้ไม่ได้ออกอากาศ" }[st];
  return (
    <div className="card flex items-center gap-4 p-4">
      <audio ref={ref} onError={() => st !== "idle" && setSt("offline")} />
      <button type="button" onClick={st === "live" || st === "loading" ? stop : play} aria-label={st === "live" ? "หยุดฟังวิทยุ" : "ฟังวิทยุ"} className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full bg-brown text-xl text-white hover:bg-brown-dark">
        {st === "live" || st === "loading" ? "■" : "▶"}
      </button>
      <div className="min-w-0">
        <p className="font-semibold">📻 {name}</p>
        <p className="flex items-center gap-2 text-sm text-muted" role="status">
          {st === "live" && <span className="inline-flex items-center gap-1 rounded bg-bad px-1.5 text-xs font-semibold text-white">● LIVE</span>}
          {label}
        </p>
      </div>
    </div>
  );
}
