"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, ZoomIn } from "lucide-react";

export function ProductGallery({ images, name }: { images: { id: number; url: string; alt: string | null }[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [fullscreen, setFullscreen] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const image = images[active];

  function move(event: React.MouseEvent<HTMLDivElement>) {
    if (!frame.current) return;
    const rect = frame.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  if (!image) {
    return <div className="aspect-square rounded-2xl bg-cream" />;
  }

  return (
    <>
      <div className="flex flex-col-reverse gap-3 md:flex-row">
        <div className="flex gap-2 overflow-x-auto md:w-20 md:flex-col md:overflow-visible">
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all md:w-full ${
                active === index ? "border-navy" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={item.url} alt={item.alt || name} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>

        <div
          ref={frame}
          onMouseMove={move}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onClick={() => setFullscreen(true)}
          className="group relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-cream"
        >
          <Image
            src={image.url}
            alt={image.alt || name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500"
            style={{ transformOrigin: origin, transform: zoom ? "scale(1.7)" : "scale(1)" }}
          />
          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-ivory/85 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.1em] text-ink/60 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <ZoomIn className="size-3.5" /> Hover to zoom
          </div>
          <button
            type="button"
            aria-label="Open full image"
            className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-ivory/85 text-ink shadow-sm backdrop-blur transition-colors hover:bg-navy hover:text-ivory"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-navy/90 p-4" onClick={() => setFullscreen(false)}>
          <div className="relative max-h-[88vh] w-full max-w-4xl">
            <Image src={image.url} alt={image.alt || name} width={1400} height={1400} className="max-h-[88vh] w-full rounded-xl object-contain" />
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-5 top-5 rounded-full border border-ivory/30 px-4 py-2 text-xs uppercase tracking-[0.1em] text-ivory"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
