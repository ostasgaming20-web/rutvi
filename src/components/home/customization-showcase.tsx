"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Layers } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const techniques = [
  {
    title: "Logo printing",
    description:
      "Screen, pad and UV printing reproduce your mark with crisp edges on paper, metal and fabric. Best for flat surfaces and multi-colour artwork.",
    image: "/uploads/products/re101p-metal-pen.jpg",
    detail: "Up to 4 colours · from ₹15 per unit",
  },
  {
    title: "Laser engraving",
    description:
      "A permanent, tactile mark etched into metal, wood and leather. Ideal for pens, bottles, desk objects and executive gifts that should age well.",
    image: "/uploads/products/re002d-notebook-diary.jpg",
    detail: "Permanent finish · from ₹40 per unit",
  },
  {
    title: "Embossing",
    description:
      "Raised or debossed branding on leather and paper adds a quiet, tactile luxury that printed logos cannot match.",
    image: "/uploads/products/re003d-gift-set.jpg",
    detail: "Blind or foil · from ₹35 per unit",
  },
  {
    title: "Personalised packaging",
    description:
      "Printed sleeves, name tags, tissue and custom inserts turn a good gift into a considered unboxing moment.",
    image: "/uploads/products/gift-bags.jpg",
    detail: "Fully custom · quoted per brief",
  },
  {
    title: "Custom gift boxes",
    description:
      "Rigid boxes built to size, wrapped in your chosen material and finished with satin ribbon, foil or a magnetic closure.",
    image: "/uploads/products/re004d-diary-stand.jpg",
    detail: "Made to order · from ₹180 per unit",
  },
];

export function CustomizationShowcase() {
  const [active, setActive] = useState(0);
  const item = techniques[active];

  return (
    <section className="relative overflow-hidden bg-[#f1ebdf] py-20 md:py-28">
      <div className="pointer-events-none absolute -right-40 top-10 size-[32rem] rounded-full border border-ink/5" />
      <div className="container-lux relative">
        <SectionHeading
          eyebrow="Your brand, beautifully applied"
          title={
            <>
              Customisation that feels <span className="italic text-navy">considered</span>
            </>
          }
          description="Every branding method is chosen to suit the material, the budget and the moment. Explore the finishes available across our collection."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="flex flex-col" data-reveal>
            {techniques.map((technique, index) => (
              <button
                key={technique.title}
                type="button"
                onClick={() => setActive(index)}
                className={`group flex items-center justify-between gap-4 border-b py-5 text-left transition-colors ${
                  active === index ? "border-navy/30" : "border-ink/10 hover:border-ink/25"
                }`}
                aria-pressed={active === index}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={`grid size-8 place-items-center rounded-full border text-[0.6rem] transition-colors ${
                      active === index ? "border-navy bg-navy text-ivory" : "border-ink/20 text-ink/40"
                    }`}
                  >
                    {active === index ? <Check className="size-3.5" /> : String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className={`block text-base font-medium ${active === index ? "text-navy" : "text-ink/70"}`}>
                      {technique.title}
                    </span>
                    <span className="mt-0.5 block text-[0.66rem] uppercase tracking-[0.08em] text-ink/38">
                      {technique.detail}
                    </span>
                  </span>
                </span>
                <Layers className={`size-4 transition-opacity ${active === index ? "text-gold opacity-100" : "opacity-0"}`} />
              </button>
            ))}
            <p className="mt-6 text-sm leading-relaxed text-ink/60">{item.description}</p>
          </div>

          <div className="relative" data-reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy shadow-[0_40px_80px_-50px_rgba(13,31,60,0.7)]">
              {techniques.map((technique, index) => (
                <Image
                  key={technique.title}
                  src={technique.image}
                  alt={technique.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={`object-cover transition-all duration-700 ${
                    active === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/55 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[0.55rem] tracking-[0.2em] uppercase text-gold-light">Finish {String(active + 1).padStart(2, "0")}</p>
                  <p className="mt-1 text-xl text-ivory">{item.title}</p>
                </div>
                <span className="rounded-full border border-ivory/25 bg-ivory/10 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.1em] text-ivory backdrop-blur">
                  {item.detail}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {techniques.map((technique, index) => (
                <button
                  key={technique.title}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Show ${technique.title}`}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    active === index ? "border-navy" : "border-transparent opacity-55 hover:opacity-90"
                  }`}
                >
                  <Image src={technique.image} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
