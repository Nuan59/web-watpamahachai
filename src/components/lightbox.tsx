"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type GalleryPhoto = { id: string; src: string; caption: string };

export function PhotoGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const step = useCallback((d: number) => setOpen((o) => (o == null ? o : (o + d + photos.length) % photos.length)), [photos.length]);
  useEffect(() => {
    if (open == null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, step]);
  const cur = open == null ? null : photos[open];
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button type="button" onClick={() => setOpen(i)} className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-md border border-line bg-cream">
              <Image src={p.src} alt={p.caption || `ภาพที่ ${i + 1}`} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="object-cover transition group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      {cur && (
        <div role="dialog" aria-modal="true" aria-label="ดูภาพ" className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="flex justify-between text-white">
            <span className="text-sm num">{open! + 1} / {photos.length}</span>
            <button type="button" onClick={() => setOpen(null)} className="btn btn-sm">ปิด</button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
            <Image src={cur.src} alt={cur.caption} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="flex items-center justify-between gap-4 text-white">
            <button type="button" onClick={() => step(-1)} className="btn btn-sm">‹ ก่อนหน้า</button>
            <p className="text-center text-sm">{cur.caption}</p>
            <button type="button" onClick={() => step(1)} className="btn btn-sm">ถัดไป ›</button>
          </div>
        </div>
      )}
    </>
  );
}
