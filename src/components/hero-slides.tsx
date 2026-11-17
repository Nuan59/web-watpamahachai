"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/slides";

/** Photo slideshow at the top of the home page. Pauses on hover/focus and when motion is reduced. */
export function HeroSlides({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((k: number) => setI((k + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(i + 1), 6000);
    return () => clearTimeout(t);
  }, [i, n, paused, go]);

  if (!n) return null;
  return (
    <section
      aria-roledescription="carousel"
      aria-label="ภาพบรรยากาศวัด"
      className="relative isolate overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      <div className="relative aspect-[4/3] max-h-[78vh] w-full sm:aspect-[16/8] lg:aspect-[16/6.5]">
        {slides.map((s, k) => {
          const body = (
            <>
              <Image src={s.src} alt={s.title || "ภาพบรรยากาศวัดป่ามหาไชย"} fill sizes="100vw" priority={k === 0} className="object-cover" />
              {(s.title || s.caption) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent pb-12 pt-24 sm:pb-14">
                  <div className="wrap text-white">
                    {s.title && <p className="font-display text-xl font-semibold drop-shadow sm:text-4xl">{s.title}</p>}
                    {s.caption && <p className="mt-1 max-w-2xl text-sm text-white/90 drop-shadow sm:text-lg">{s.caption}</p>}
                    {s.href && <span className="mt-3 inline-flex rounded-md bg-white/95 px-4 py-1.5 text-sm font-semibold text-brown-dark">ดูรายละเอียด →</span>}
                  </div>
                </div>
              )}
            </>
          );
          return (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`ภาพที่ ${k + 1} จาก ${n}`}
              aria-hidden={k !== i}
              className={`absolute inset-0 transition-opacity duration-700 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              {s.href ? (
                s.href.startsWith("/") ? <Link href={s.href} tabIndex={k === i ? 0 : -1} className="block h-full">{body}</Link>
                  : <a href={s.href} target="_blank" rel="noopener" tabIndex={k === i ? 0 : -1} className="block h-full">{body}</a>
              ) : body}
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <>
          <button type="button" onClick={() => go(i - 1)} aria-label="ภาพก่อนหน้า" className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/80 text-xl text-brown-dark hover:bg-white sm:grid">‹</button>
          <button type="button" onClick={() => go(i + 1)} aria-label="ภาพถัดไป" className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/80 text-xl text-brown-dark hover:bg-white sm:grid">›</button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1">
            {slides.map((s, k) => (
              <button key={s.id} type="button" onClick={() => go(k)} aria-label={`ไปที่ภาพที่ ${k + 1}`} aria-current={k === i} className="grid h-8 w-8 cursor-pointer place-items-center">
                <span className={`block h-2 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-2 bg-white/60"}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
