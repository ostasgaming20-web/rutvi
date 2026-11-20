"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Award, PackageCheck, Sparkles } from "lucide-react";
import type { HeroSettings } from "@/lib/settings";

const GiftBoxScene = dynamic(() => import("@/components/three/gift-box-scene"), {
  ssr: false,
  loading: () => null,
});

export function HomeHero({ hero, image }: { hero: HeroSettings; image: string }) {
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(motion.matches);
    const timer = window.setTimeout(() => setReady(true), 120);
    const introTimer = window.setTimeout(() => setShowIntro(false), 1500);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(introTimer);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_100%_at_78%_18%,#fbf6ec_0%,#f4ecdd_42%,#eee3d1_100%)]">
      <div className="pointer-events-none absolute -left-40 top-24 size-[30rem] rounded-full border border-ink/6" />
      <div className="pointer-events-none absolute -left-24 top-40 size-[18rem] rounded-full border border-gold/20" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(60%_60%_at_60%_40%,rgba(255,255,255,0.9),transparent_70%)]" />

      <div className="container-lux relative grid min-h-[calc(100svh-6rem)] items-center gap-8 py-10 lg:grid-cols-[1.02fr_1.18fr] lg:gap-4 lg:py-16">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="eyebrow">{hero.eyebrow}</span>
          </div>

          <h1 className="display mt-6 text-[clamp(2.9rem,6.2vw,5.1rem)] text-ink">
            Make Every Gift a{" "}
            <span className="relative inline-block italic text-navy">
              Lasting
              <svg
                viewBox="0 0 220 12"
                className="absolute -bottom-2 left-0 w-full text-gold"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2 9C48 3 128 2 218 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>{" "}
            Impression.
          </h1>

          <p className="mt-7 max-w-md text-[0.98rem] leading-relaxed text-ink/62">{hero.description}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/products" className="btn-base btn-navy group">
              Explore Our Collection
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/quote" className="btn-base btn-ghost">
              Request a Quote
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.68rem] font-medium tracking-[0.08em] uppercase text-ink/55">
            <span className="inline-flex items-center gap-2">
              <PackageCheck className="size-4 text-gold" /> Bulk order ready
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-gold" /> Custom branding
            </span>
            <span className="inline-flex items-center gap-2">
              <Award className="size-4 text-gold" /> Pan-India delivery
            </span>
          </div>
        </div>

        <div className="relative h-[52vh] min-h-[340px] w-full sm:h-[58vh] lg:h-[min(76vh,720px)]">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
            <Image src={image} alt="Premium corporate gift box" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="scale-105 object-cover opacity-25 blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f2e9d9] via-transparent to-[#f7f1e6]/40" />
          </div>

          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <GiftBoxScene reduced={reduced} />
          </div>

          <div className="pointer-events-none absolute left-1 top-6 hidden animate-float rounded-2xl border border-white/70 bg-white/65 px-4 py-3 shadow-[0_20px_50px_-30px_rgba(20,19,15,0.6)] backdrop-blur-md sm:block">
            <p className="text-[0.55rem] font-semibold tracking-[0.18em] uppercase text-gold">Included</p>
            <p className="mt-1 text-sm font-medium text-ink">Satin ribbon &amp; keepsake box</p>
          </div>
          <div
            className="pointer-events-none absolute bottom-16 right-0 hidden animate-float rounded-2xl border border-white/70 bg-white/65 px-4 py-3 shadow-[0_20px_50px_-30px_rgba(20,19,15,0.6)] backdrop-blur-md sm:block"
            style={{ animationDelay: "1.6s" }}
          >
            <p className="text-[0.55rem] font-semibold tracking-[0.18em] uppercase text-gold">Personalised</p>
            <p className="mt-1 text-sm font-medium text-ink">Your logo, beautifully applied</p>
          </div>

          <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-[0.6rem] font-medium tracking-[0.16em] uppercase text-ink/35">
            Drag to explore · Move your cursor
          </p>
        </div>
      </div>

      <div className="container-lux relative z-10 flex items-center justify-between pb-7">
        <div className="flex items-center gap-3 text-[0.62rem] font-medium tracking-[0.2em] uppercase text-ink/40">
          <span className="relative flex size-8 items-center justify-center rounded-full border border-ink/15">
            <ArrowDown className="size-3.5 animate-bounce" />
          </span>
          Scroll to discover
        </div>
        <p className="hidden text-[0.62rem] tracking-[0.18em] uppercase text-ink/35 sm:block">
          Andheri East, Mumbai · Pan-India delivery
        </p>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 z-40 grid place-items-center bg-[#0d1f3c] transition-opacity duration-700 ${
          showIntro ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <div className="text-center">
          <p className="text-[0.6rem] tracking-[0.5em] uppercase text-gold">RUTVI ENTERPRISE</p>
          <div className="mx-auto mt-5 h-px w-32 overflow-hidden bg-ivory/15">
            <div className="h-full w-full origin-left animate-[shimmer-line_1.4s_ease-in-out] bg-gold" />
          </div>
        </div>
      </div>
    </section>
  );
}
