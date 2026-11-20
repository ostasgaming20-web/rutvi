import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Boxes, Brush, Gift, GraduationCap, HeartHandshake, PartyPopper, Trophy, Truck } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Corporate Gifting Services & Promotional Merchandise",
  description:
    "Corporate gifting, custom branding, promotional merchandise, employee onboarding kits, recognition awards, event giveaways and festive hampers. Mumbai-based, delivering across India.",
  alternates: { canonical: "/services" },
};

const services = [
  {
    icon: Gift,
    title: "Corporate gifting",
    text: "Client thank-yous, leadership gifts and milestone pieces, curated around your budget and relationship.",
    points: ["Curated options", "Branded packaging", "Cards and inserts"],
  },
  {
    icon: Brush,
    title: "Custom branding",
    text: "Printing, laser engraving, embossing, foil and embroidery, matched to the material and quantity.",
    points: ["Artwork review", "Sample approval", "Consistent output"],
  },
  {
    icon: Boxes,
    title: "Promotional merchandise",
    text: "High-recall giveaways for conferences, launches and campus drives, packed and labelled by size.",
    points: ["Bulk pricing", "Kit assembly", "Multi-city dispatch"],
  },
  {
    icon: GraduationCap,
    title: "Employee onboarding",
    text: "Welcome kits that make day one feel considered, with named packaging and practical essentials.",
    points: ["Name personalisation", "Custom inserts", "Recurring orders"],
  },
  {
    icon: Trophy,
    title: "Recognition & awards",
    text: "Trophies, plaques and crystal awards engraved for milestones, anniversaries and performance.",
    points: ["Custom engraving", "Presentation boxes", "Short lead times"],
  },
  {
    icon: PartyPopper,
    title: "Event & festive gifting",
    text: "Diwali, New Year and event gifting, from single hampers to thousands of branded giveaways.",
    points: ["Seasonal curation", "Gift box design", "Delivery scheduling"],
  },
];

export default async function ServicesPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        <Image
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=82"
          alt="Corporate event gifting"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#081426] via-[#081426]/90 to-[#081426]/40" />
        <div className="container-lux relative py-20 md:py-28">
          <nav className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-ivory/40" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ivory">Home</Link>
            <span>/</span>
            <span className="text-ivory/70">Services</span>
          </nav>
          <div className="mt-6 max-w-2xl">
            <span className="eyebrow !text-gold-light">What we do</span>
            <h1 className="display mt-4 text-[clamp(2.7rem,6vw,4.7rem)] text-ivory">
              Corporate gifting, end to <span className="italic text-gold-light">end</span>.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/65">
              From a single leadership gift to a multi-city employee rollout, we handle sourcing, branding, packing and
              delivery with one point of contact.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quote" className="btn-base btn-gold">Request a quote</Link>
              <Link href="/customize" className="btn-base btn-light">Build a gift</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-lux">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div key={service.title} className="surface group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-full bg-cream text-navy">
                    <service.icon className="size-5" strokeWidth={1.5} />
                  </span>
                  <span className="text-[0.58rem] tracking-[0.16em] text-ink/20">0{index + 1}</span>
                </div>
                <h2 className="mt-5 text-base font-semibold text-ink">{service.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-ink/55">{service.text}</p>
                <ul className="mt-4 space-y-1.5">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-[0.7rem] text-ink/60">
                      <span className="size-1 rounded-full bg-gold" /> {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/8 bg-[#f1ebdf] py-14">
        <div className="container-lux grid gap-6 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Delivery across India", text: "Tracked dispatch to one office or many." },
            { icon: HeartHandshake, title: "Dedicated support", text: "One contact from brief to delivery." },
            { icon: Boxes, title: "Bulk ready", text: "From 10 to 10,000 units with consistent quality." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 size-5 shrink-0 text-gold" />
              <div>
                <h2 className="text-sm font-semibold text-ink">{item.title}</h2>
                <p className="mt-1 text-xs text-ink/55">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container-lux flex flex-col items-start justify-between gap-6 rounded-2xl bg-navy p-7 md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold">Have a brief?</p>
            <h2 className="display mt-2 text-3xl text-ivory">We will build the right proposal.</h2>
            <p className="mt-2 max-w-lg text-sm text-ivory/55">
              Call {settings.contact.phone} or share your requirement and we will respond within one business day.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/quote" className="btn-base btn-gold">Request a quote</Link>
            <Link href="/contact" className="btn-base btn-light">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
