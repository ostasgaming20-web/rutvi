"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Boxes, Clock, HeartHandshake, PackageCheck, Sparkles } from "lucide-react";
import type { StatsSettings } from "@/lib/settings";
import { SectionHeading } from "@/components/site/section-heading";

const reasons = [
  { icon: BadgeCheck, title: "Quality you can feel", text: "Materials and finishes are checked piece by piece before dispatch." },
  { icon: Sparkles, title: "Customised branding", text: "Print, engraving, embossing and foil applied with precision." },
  { icon: Boxes, title: "Flexible quantities", text: "From a 10-piece leadership order to 10,000 event giveaways." },
  { icon: PackageCheck, title: "Professional presentation", text: "Packaging designed to be opened slowly and remembered." },
  { icon: HeartHandshake, title: "Gifting specialists", text: "One team for sourcing, branding, packing and delivery." },
  { icon: Clock, title: "Dependable timelines", text: "Clear lead times and proactive updates from enquiry to delivery." },
];

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const numeric = parseFloat(value.replace(/[^\d.]/g, ""));
  const suffix = value.replace(/[\d.,]/g, "");

  useEffect(() => {
    if (!ref.current || Number.isNaN(numeric)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = ref.current;
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = numeric * eased;
          const formatted = numeric % 1 === 0 ? Math.round(current).toLocaleString("en-IN") : current.toFixed(1);
          setDisplay(`${formatted}${suffix}`);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [numeric, suffix]);

  return <span ref={ref}>{display}</span>;
}

export function WhyChoose({ stats }: { stats: StatsSettings }) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="container-lux">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="relative" data-reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=82"
                alt="A corporate gifting consultation at RUTVI ENTERPRISE"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/70 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/15 bg-[#0b1526]/55 p-5 backdrop-blur-md">
                <p className="text-[0.55rem] uppercase tracking-[0.2em] text-gold-light">Based in Andheri East</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory/80">
                  A Mumbai gifting partner for teams that care how a gift is received.
                </p>
              </div>
            </div>
            <div className="absolute -right-4 top-6 hidden rounded-xl border border-ink/8 bg-[#fffdf9] px-5 py-4 shadow-xl sm:block">
              <p className="text-[0.55rem] uppercase tracking-[0.16em] text-stone">Average response</p>
              <p className="mt-1 text-lg font-semibold text-navy">Within 1 business day</p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Why Rutvi Enterprise"
              title={
                <>
                  A gifting partner, not just a <span className="italic text-navy">supplier</span>
                </>
              }
              description="We understand that corporate gifting is more than a transaction. It is a way to strengthen relationships, recognise people and make your brand memorable."
            />
            <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div key={reason.title} className="flex gap-3.5" data-reveal>
                  <reason.icon className="mt-0.5 size-5 shrink-0 text-gold" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{reason.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink/52">{reason.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-y-8 border-y border-ink/8 py-10 md:grid-cols-4" data-reveal>
          {[
            { label: "Curated products", value: stats.products },
            { label: "Gift categories", value: stats.categories },
            { label: "Hamper collections", value: stats.hampers },
            { label: "Delivery coverage", value: stats.delivery },
          ].map((stat) => (
            <div key={stat.label} className="text-center md:border-r md:border-ink/8 md:last:border-0">
              <p className="display text-[clamp(2rem,4vw,3rem)] text-navy">
                <Counter value={stat.value} />
              </p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-ink/45">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
