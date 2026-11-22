"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Gift, MousePointerClick, Sparkles } from "lucide-react";
import type { HeroSettings } from "@/lib/settings";

const GiftBoxScene = dynamic(() => import("@/components/three/gift-box-scene"), {
  ssr: false,
  loading: () => null,
});

const GiftBoxViewer = dynamic(() => import("@/components/three/gift-box-viewer"), {
  ssr: false,
  loading: () => null,
});

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export function HomeHero({ hero, image }: { hero: HeroSettings; image: string }) {
  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showroom, setShowroom] = useState(false);
  const autoOpened = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReduced = motion.matches;
    setReduced(isReduced);
    setWebgl(supportsWebGL());

    const timer = window.setTimeout(() => setReady(true), 140);

    let autoplay: number | undefined;
    if (!isReduced) {
      autoplay = window.setTimeout(() => {
        if (!autoOpened.current) {
          autoOpened.current = true;
          setOpen(true);
        }
      }, 1100);
    } else {
      setOpen(true);
    }

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    motion.addEventListener("change", onChange);

    return () => {
      window.clearTimeout(timer);
      if (autoplay) window.clearTimeout(autoplay);
      motion.removeEventListener("change", onChange);
    };
  }, []);

  function enterShowroom() {
    setHasInteracted(true);
    setOpen(true);
    setShowroom(true);
  }

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_100%_at_72%_12%,#fdf7ee_0%,#f6eddd_44%,#efe3d1_100%)]">
      {/* pastel decorative graphics */}
      <div className="pointer-events-none absolute -left-44 top-24 size-[34rem] rounded-full bg-[radial-gradient(circle_at_45%_45%,rgba(243,208,210,0.4),transparent_64%)]" />
      <div className="pointer-events-none absolute -left-24 top-52 size-[19rem] rounded-full border border-gold/20" />
      <div className="pointer-events-none absolute right-[-14%] top-1/3 size-[30rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(246,222,222,0.34),transparent_68%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_52%_at_64%_40%,rgba(255,255,255,0.95),transparent_74%)]" />

      <div className="container-lux relative grid min-h-[calc(100svh-6rem)] items-center gap-6 py-10 lg:grid-cols-[0.94fr_1.24fr] lg:gap-2 lg:py-14">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-gold" />
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-ink/70">
              RUTVI ENTERPRISE
            </span>
          </div>

          <h1 className="display mt-7 text-[clamp(2.5rem,5vw,4.35rem)] leading-[1.04] text-ink">
            The Art of <span className="italic text-navy">Thoughtful</span>
            <br />
            Gifting
          </h1>

          <p className="mt-6 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-ink/50">
            Premium Corporate Gifts <span className="mx-2 text-gold">|</span> Customized Hampers{" "}
            <span className="mx-2 text-gold">|</span> Executive Stationery
          </p>

          <p className="mt-5 max-w-md text-[0.96rem] leading-relaxed text-ink/60">{hero.description}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/products" className="btn-base btn-navy group">
              EXPLORE OUR COLLECTION
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/quote" className="btn-base btn-ghost">
              REQUEST A QUOTE
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.64rem] font-medium uppercase tracking-[0.1em] text-ink/50">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-gold" /> Custom branding
            </span>
            <span className="inline-flex items-center gap-2">
              <Gift className="size-4 text-gold" /> Bulk order ready
            </span>
          </div>
        </div>

        <div className="relative h-[54vh] min-h-[360px] w-full sm:h-[60vh] lg:h-[min(78vh,740px)]">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[radial-gradient(78%_70%_at_52%_44%,#fffaf1_0%,#f7eedd_58%,#f0e5d3_100%)]">
            <div className="absolute inset-0 bg-[radial-gradient(50%_38%_at_50%_86%,rgba(201,164,104,0.16),transparent_70%)]" />
            <div className="absolute inset-x-10 bottom-8 h-24 rounded-[50%] bg-[radial-gradient(closest-side,rgba(90,74,54,0.16),transparent)] blur-xl" />
          </div>

          {webgl ? (
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
            >
              <GiftBoxScene open={open} onToggle={enterShowroom} reduced={reduced} />
            </div>
          ) : (
            <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
              <Image
                src={image}
                alt="Premium corporate gift box with satin ribbon"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover opacity-95"
              />
            </div>
          )}

          <button
            type="button"
            onClick={enterShowroom}
            className="absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-4 py-2.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-ink/65 shadow-[0_12px_30px_-22px_rgba(20,19,15,0.7)] backdrop-blur transition-colors hover:border-navy/30 hover:text-navy"
          >
            <MousePointerClick className="size-3.5 text-gold" />
            Click the gift box to enter the showroom
          </button>

          {open && hasInteracted && (
            <div className="pointer-events-none absolute right-4 top-4 hidden animate-float rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-[0_20px_50px_-30px_rgba(20,19,15,0.6)] backdrop-blur-md sm:block">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-gold">Inside the box</p>
              <p className="mt-1 text-sm font-medium text-ink">Diary · Pen · Notebook · Card holder</p>
            </div>
          )}
        </div>
      </div>

      {showroom && webgl && <GiftBoxViewer onClose={() => setShowroom(false)} />}

      <div className="container-lux relative z-10 flex items-center justify-between pb-7">
        <div className="flex items-center gap-3 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-ink/40">
          <span className="relative flex size-8 items-center justify-center rounded-full border border-ink/15">
            <ArrowDown className="size-3.5 animate-bounce" />
          </span>
          Scroll to discover
        </div>
        <p className="hidden text-[0.62rem] uppercase tracking-[0.18em] text-ink/35 sm:block">
          Andheri East, Mumbai · Pan-India delivery
        </p>
      </div>
    </section>
  );
}
