import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Leaf, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "About RUTVI ENTERPRISE — Corporate Gifting in Mumbai",
  description:
    "RUTVI ENTERPRISE is a Mumbai-based corporate gifting partner supplying premium gifts, customized merchandise and curated hampers to businesses across India.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: Sparkles,
    title: "Considered by design",
    text: "We choose pieces for how they feel in the hand and how they arrive, not just how they photograph.",
  },
  {
    icon: BadgeCheck,
    title: "Reliable by habit",
    text: "Clear quotations, realistic lead times and updates you do not have to chase.",
  },
  {
    icon: HeartHandshake,
    title: "Personal service",
    text: "One team from brief to delivery, with advice rather than a catalogue dump.",
  },
  {
    icon: Leaf,
    title: "Responsible sourcing",
    text: "Reusable packaging and recycled materials wherever the brief allows.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/8 bg-[radial-gradient(100%_100%_at_75%_0%,#fbf6ec,#f1e9da)] py-14 md:py-20">
        <div className="container-lux">
          <nav className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy">Home</Link>
            <span>/</span>
            <span className="text-ink/70">About us</span>
          </nav>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="eyebrow">Our story</span>
              <h1 className="display mt-4 text-[clamp(2.7rem,5.8vw,4.6rem)] text-ink">
                Gifting, treated as a <span className="italic text-navy">craft</span>.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink/60">
                RUTVI ENTERPRISE is a corporate gifting partner based in Andheri East, Mumbai. We help businesses
                choose, brand and deliver gifts that feel personal — for clients, employees, events and festivals.
              </p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/60">
                Our work sits between sourcing and storytelling: finding well-made products, applying your identity
                with care, and presenting everything in packaging worth opening slowly.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/products" className="btn-base btn-navy">Explore the catalogue</Link>
                <Link href="/contact" className="btn-base btn-ghost">Visit the studio</Link>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82"
                alt="The RUTVI ENTERPRISE gifting team at work"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/55 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/15 bg-[#0b1526]/55 p-4 backdrop-blur-md">
                <p className="text-[0.55rem] uppercase tracking-[0.18em] text-gold-light">Based in</p>
                <p className="mt-1 text-sm text-ivory/85">Kondivita Road, Andheri East, Mumbai</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-lux">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <span className="eyebrow">What we believe</span>
              <h2 className="display mt-4 text-[clamp(2.1rem,4.2vw,3.3rem)] text-ink">
                A good gift does more than say <span className="italic text-navy">thank you</span>.
              </h2>
            </div>
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {values.map((value) => (
                <div key={value.title}>
                  <value.icon className="size-5 text-gold" strokeWidth={1.5} />
                  <h3 className="mt-3 text-sm font-semibold text-ink">{value.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink/55">{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f1ebdf] py-16 md:py-24">
        <div className="container-lux grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl">
            <Image
              src="/uploads/products/re003d-gift-set.jpg"
              alt="Premium gift box with satin ribbon"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <span className="eyebrow">How we work</span>
            <h2 className="display mt-4 text-[clamp(2.1rem,4.2vw,3.3rem)] text-ink">
              Sourcing, branding and packing under one roof
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/60">
              We keep the process simple. You share the occasion and constraints; we propose products, apply your
              branding, pack everything by hand and coordinate delivery — whether that is one office or twenty.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink/65">
              {[
                "Product sourcing and sampling",
                "In-house branding coordination",
                "Hand packing and quality checks",
                "Multi-city dispatch and tracking",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/services" className="mt-7 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-navy">
              Explore our services <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-lux">
          <div className="grid gap-8 border-y border-ink/8 py-10 sm:grid-cols-3">
            {[
              { label: "Studio", value: "Andheri East, Mumbai" },
              { label: "Delivery", value: "Across India" },
              { label: "Working hours", value: settings.contact.hours },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[0.58rem] uppercase tracking-[0.16em] text-stone">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-ink">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl bg-navy p-7 md:flex-row md:items-center md:p-10">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold">Start a conversation</p>
              <h2 className="display mt-2 text-3xl text-ivory">Tell us what you are planning.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/quote" className="btn-base btn-gold">Request a quote</Link>
              <Link href="/contact" className="btn-base btn-light">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
