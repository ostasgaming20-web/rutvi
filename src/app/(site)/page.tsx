import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/settings";
import {
  getCategories,
  getCustomizationOptions,
  getFeaturedHampers,
  getFeaturedProducts,
  getProductsForSelect,
  getPublishedTestimonials,
} from "@/lib/queries";
import { HomeHero } from "@/components/home/home-hero";
import { BusinessHighlights } from "@/components/home/business-highlights";
import { ExploreCategories } from "@/components/home/explore-categories";
import { CustomizationShowcase } from "@/components/home/customization-showcase";
import { HamperShowcase } from "@/components/home/hamper-showcase";
import { WhyChoose } from "@/components/home/why-choose";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProductCard } from "@/components/site/product-card";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { SectionHeading } from "@/components/site/section-heading";
import { ScrollReveal } from "@/components/site/scroll-reveal";

export const metadata: Metadata = {
  title: "Corporate Gifts & Custom Hampers in Mumbai",
  description:
    "RUTVI ENTERPRISE supplies premium corporate gifts, customized promotional merchandise and curated corporate hampers in Mumbai, with delivery across India.",
  alternates: { canonical: "/" },
};

const marquee = [
  "Corporate gift sets",
  "Customized pens",
  "Diaries & notebooks",
  "Bottles & mugs",
  "Laptop bags",
  "Tech accessories",
  "Trophies & awards",
  "Employee welcome kits",
  "Festive hampers",
];

export default async function HomePage() {
  const [settings, categories, featured, hampers, products, customizationOptions, testimonials] = await Promise.all([
    getSettings(),
    getCategories(),
    getFeaturedProducts(8),
    getFeaturedHampers(3),
    getProductsForSelect(),
    getCustomizationOptions(),
    getPublishedTestimonials(),
  ]);

  return (
    <ScrollReveal>
      <HomeHero
        hero={settings.hero}
        image="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1400&q=82"
      />
      <BusinessHighlights />

      <div className="overflow-hidden border-b border-ink/7 bg-[#fffdf9] py-4">
        <div className="flex w-max animate-marquee items-center gap-10">
          {[...marquee, ...marquee].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-10 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-ink/38">
              {item}
              <span className="size-1 rounded-full bg-gold" />
            </span>
          ))}
        </div>
      </div>

      <ExploreCategories categories={categories} />

      <section className="bg-[#fffdf9] py-20 md:py-28">
        <div className="container-lux">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Signature pieces"
              title={
                <>
                  Featured gifts, chosen by our <span className="italic text-navy">team</span>
                </>
              }
              description="A short edit of the pieces our clients return for — thoughtfully made, easy to brand and ready for bulk orders."
            />
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-navy"
              data-reveal
            >
              Shop all gifts
              <span className="grid size-8 place-items-center rounded-full border border-navy/20 transition-colors group-hover:bg-navy group-hover:text-ivory">
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <div key={product.id} data-reveal>
                <ProductCard product={product} whatsapp={settings.contact.whatsapp} priority={index < 2} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CustomizationShowcase />
      <HamperShowcase hampers={hampers} />
      <WhyChoose stats={settings.stats} />
      <HowItWorks contactEmail={settings.contact.email} />

      {testimonials.length > 0 && (
        <section className="bg-[#fffdf9] py-20">
          <div className="container-lux">
            <SectionHeading
              align="center"
              eyebrow="Client words"
              title={
                <>
                  Trusted for the moments that <span className="italic text-navy">matter</span>
                </>
              }
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure key={testimonial.id} className="surface rounded-xl p-6" data-reveal>
                  <div className="flex gap-1 text-gold" aria-label={`${testimonial.rating} out of 5`}>
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <Sparkles key={index} className="size-3.5" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-ink/70">“{testimonial.quote}”</blockquote>
                  <figcaption className="mt-5 text-xs">
                    <span className="font-semibold text-ink">{testimonial.customerName}</span>
                    {testimonial.company && <span className="text-stone"> · {testimonial.company}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-navy py-20 md:py-24" id="enquiry">
        <div className="pointer-events-none absolute -left-32 top-10 size-[30rem] rounded-full border border-ivory/6" />
        <div className="container-lux relative grid items-center gap-12 lg:grid-cols-[1fr_1.02fr]">
          <div data-reveal>
            <span className="eyebrow !text-gold-light">Corporate enquiry</span>
            <h2 className="display mt-5 text-[clamp(2.3rem,4.5vw,3.7rem)] text-ivory">
              Let&apos;s make your next gift <span className="italic text-gold-light">unforgettable</span>.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/60">
              Share the occasion, quantity and budget. We will come back with a considered proposal, samples where
              needed, and clear timelines.
            </p>

            <div className="relative mt-10 hidden max-w-md sm:block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-ivory/10">
                <Image
                  src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1000&q=82"
                  alt="A curated corporate gift hamper"
                  fill
                  sizes="420px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/60 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-4 w-52 rounded-xl border border-white/15 bg-[#10233f]/90 p-4 shadow-2xl backdrop-blur">
                <p className="text-[0.55rem] uppercase tracking-[0.18em] text-gold">Our promise</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ivory/75">A response within one business day, every time.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-8 text-ivory/60">
              <div>
                <p className="text-[0.55rem] uppercase tracking-[0.16em] text-gold/80">Call</p>
                <a href={`tel:${settings.contact.phoneHref}`} className="mt-1 block text-sm hover:text-ivory">
                  {settings.contact.phone}
                </a>
              </div>
              <div>
                <p className="text-[0.55rem] uppercase tracking-[0.16em] text-gold/80">Email</p>
                <a href={`mailto:${settings.contact.email}`} className="mt-1 block text-sm hover:text-ivory">
                  {settings.contact.email}
                </a>
              </div>
            </div>
          </div>

          <div data-reveal>
            <EnquiryForm
              products={products}
              customizationOptions={customizationOptions}
              whatsapp={settings.contact.whatsapp}
              sourcePage="/"
              title="Request a corporate quotation"
            />
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
