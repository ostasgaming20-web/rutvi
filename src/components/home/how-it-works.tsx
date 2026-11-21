"use client";

import { useState } from "react";
import { ClipboardList, MessageSquareQuote, PencilRuler, Send } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const steps = [
  {
    icon: ClipboardList,
    title: "Explore products",
    text: "Browse the catalogue or tell us the occasion, audience and budget.",
    detail: "Send us the brief and we shortlist pieces that fit your budget per head.",
  },
  {
    icon: PencilRuler,
    title: "Select customisation",
    text: "Choose colours, branding method and packaging. Upload your logo.",
    detail: "Share artwork as AI, PDF or high-resolution PNG — we advise on the best method.",
  },
  {
    icon: MessageSquareQuote,
    title: "Receive a quotation",
    text: "We respond within one business day with options and clear pricing.",
    detail: "Every quote itemises units, branding, packaging, taxes and delivery.",
  },
  {
    icon: Send,
    title: "Confirm your requirements",
    text: "Approve the sample, confirm quantities and we handle production and delivery.",
    detail: "Production begins after written approval, with pan-India dispatch tracked for you.",
  },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#f1ebdf] py-20 md:py-28">
      <div className="container-lux">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title={
            <>
              Four steps to a gift worth <span className="italic text-navy">remembering</span>
            </>
          }
          description="A straightforward process with one point of contact from first enquiry to final delivery."
        />

        <div className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          <div className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-ink/12 md:block">
            <div
              className="h-px bg-gold transition-[width] duration-500 ease-out"
              style={{ width: `${(active / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const isActive = active === index;
            return (
              <div key={step.title} className="relative" data-reveal>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  aria-pressed={isActive}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  className="group mx-auto flex w-full cursor-pointer flex-col items-center rounded-2xl px-2 py-2 text-center outline-none"
                >
                  <span
                    className={`relative z-10 grid size-16 place-items-center rounded-full border transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-navy/45 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-[#f1ebdf] ${
                      isActive
                        ? "-translate-y-1 border-navy bg-navy shadow-[0_18px_36px_-18px_rgba(13,31,60,0.75)]"
                        : "border-ink/10 bg-[#fffdf9] shadow-sm group-hover:-translate-y-0.5 group-hover:border-navy/30"
                    }`}
                  >
                    <step.icon
                      className={`size-6 transition-colors duration-300 ${isActive ? "text-gold-light" : "text-navy"}`}
                      strokeWidth={1.4}
                    />
                    <span
                      className={`absolute -right-1 -top-1 grid size-6 place-items-center rounded-full border text-[0.55rem] font-semibold transition-colors duration-300 ${
                        isActive ? "border-navy bg-gold text-navy" : "border-transparent bg-navy text-ivory"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </span>
                  <span
                    className={`mt-5 block text-sm font-semibold transition-colors duration-300 ${
                      isActive ? "text-navy" : "text-ink"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="mx-auto mt-2 block min-h-[3.25rem] max-w-[15rem] text-xs leading-relaxed text-ink/52">
                    {isActive ? step.detail : step.text}
                  </span>
                  <span
                    className={`mt-3 block h-px w-8 transition-all duration-300 ${
                      isActive ? "w-12 bg-gold" : "bg-ink/15"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
