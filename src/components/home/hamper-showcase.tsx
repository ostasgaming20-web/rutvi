"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gift } from "lucide-react";
import type { ProductCardData } from "@/lib/queries";
import { formatINR } from "@/lib/format";
import { SectionHeading } from "@/components/site/section-heading";

function HamperCard({ hamper }: { hamper: ProductCardData }) {
  const ref = useRef<HTMLAnchorElement>(null);

  function move(event: React.MouseEvent<HTMLAnchorElement>) {
    const card = ref.current;
    if (!card || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1200px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-6px)`;
  }

  function leave() {
    if (ref.current) ref.current.style.transform = "perspective(1200px) rotateX(0) rotateY(0) translateY(0)";
  }

  return (
    <Link
      href={`/products/${hamper.slug}`}
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className="tilt-card group relative block overflow-hidden rounded-2xl border border-ivory/10 bg-[#10233f]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {hamper.image && (
          <Image
            src={hamper.image}
            alt={hamper.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081426] via-[#081426]/20 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-ivory backdrop-blur">
          <Gift className="size-3" /> Hamper
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[0.55rem] tracking-[0.2em] uppercase text-gold-light/80">{hamper.categoryName}</p>
          <h3 className="mt-1.5 text-xl font-medium text-ivory">{hamper.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ivory/55">{hamper.shortDescription}</p>
          <div className="mt-4 flex items-center justify-between border-t border-ivory/12 pt-3">
            <span className="text-sm text-gold-light">{formatINR(hamper.pricePaise)}</span>
            <span className="inline-flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.12em] text-ivory/70 transition-colors group-hover:text-gold">
              View hamper <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HamperShowcase({ hampers }: { hampers: ProductCardData[] }) {
  return (
    <section className="relative overflow-hidden bg-navy py-20 md:py-28">
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[38rem] rounded-full border border-ivory/6" />
      <div className="pointer-events-none absolute right-10 top-10 size-64 rounded-full bg-[radial-gradient(circle,rgba(195,160,104,0.16),transparent_70%)]" />
      <div className="container-lux relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            light
            eyebrow="Premium hampers"
            title={
              <>
                Gift sets that arrive <span className="italic text-gold-light">beautifully</span>
              </>
            }
            description="Layered contents, considered packaging and a presentation worth photographing. Each hamper can be customised to your brand and budget."
          />
          <Link
            href="/hampers"
            className="inline-flex shrink-0 items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-gold-light"
            data-reveal
          >
            All hampers
            <span className="grid size-8 place-items-center rounded-full border border-gold/30">
              <ArrowUpRight className="size-3.5" />
            </span>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3" data-reveal>
          {hampers.slice(0, 3).map((hamper) => (
            <HamperCard key={hamper.id} hamper={hamper} />
          ))}
        </div>
      </div>
    </section>
  );
}
