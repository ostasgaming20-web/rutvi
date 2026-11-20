import { ClipboardList, MessageSquareQuote, PencilRuler, Send } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";

const steps = [
  {
    icon: ClipboardList,
    title: "Explore products",
    text: "Browse the catalogue or tell us the occasion, audience and budget.",
  },
  {
    icon: PencilRuler,
    title: "Select customisation",
    text: "Choose colours, branding method and packaging. Upload your logo.",
  },
  {
    icon: MessageSquareQuote,
    title: "Receive a quotation",
    text: "We respond within one business day with options and clear pricing.",
  },
  {
    icon: Send,
    title: "Confirm your requirements",
    text: "Approve the sample, confirm quantities and we handle production and delivery.",
  },
];

export function HowItWorks() {
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
          <div className="absolute left-[12%] right-[12%] top-8 hidden h-px bg-ink/12 md:block" />
          {steps.map((step, index) => (
            <div key={step.title} className="relative" data-reveal>
              <div className="relative z-10 mx-auto grid size-16 place-items-center rounded-full border border-ink/10 bg-[#fffdf9] shadow-sm">
                <step.icon className="size-6 text-navy" strokeWidth={1.4} />
                <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-navy text-[0.55rem] font-semibold text-ivory">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-center text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-[15rem] text-center text-xs leading-relaxed text-ink/52">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
