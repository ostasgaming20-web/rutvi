import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/settings";
import {
  getCategories,
  getCategoriesWithProducts,
  getCustomizationOptions,
  getFeaturedHampers,
  getFeaturedProducts,
  getProductsForSelect,
  getPublishedTestimonials,
} from "@/lib/queries";
import {
  getHomepageSections,
  getActiveCampaigns,
  defaultHomepageSections,
  type HomepageSectionData,
} from "@/lib/content";
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

const defaultMarquee = [
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
  const [
    settings,
    categories,
    categoryWithProducts,
    featured,
    hampers,
    products,
    customizationOptions,
    testimonials,
    sectionRows,
    heroCampaigns,
  ] = await Promise.all([
    getSettings(),
    getCategories(),
    getCategoriesWithProducts(),
    getFeaturedProducts(8),
    getFeaturedHampers(3),
    getProductsForSelect(),
    getCustomizationOptions(),
    getPublishedTestimonials(),
    getHomepageSections(),
    getActiveCampaigns("hero"),
  ]);

  const sections: HomepageSectionData[] =
    sectionRows.length > 0 ? sectionRows : defaultHomepageSections.map((section, index) => ({ ...section, id: -(index + 1) }));
  const enabled = sections.filter((section) => section.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const heroSection = enabled.find((section) => section.type === "hero");
  const heroCampaign = heroCampaigns[0] ?? null;

  const hero = {
    ...settings.hero,
    headline: heroSection?.title || settings.hero.headline,
    description: heroSection?.body || settings.hero.description,
    eyebrow: heroSection?.eyebrow || settings.hero.eyebrow,
  };
  const heroImage = heroSection?.imageUrl || "/uploads/products/re003d-gift-set.jpg";

  function renderSection(section: HomepageSectionData) {
    switch (section.type) {
      case "hero":
        return (
          <div key={section.id}>
            {heroCampaign ? (
              <div className="bg-[#0d1f3c] text-[#f8f5ef]">
                <div className="container-lux flex flex-wrap items-center justify-between gap-2 py-2.5 text-[0.7rem]">
                  <p>
                    <span className="font-semibold text-[#c3a068]">{heroCampaign.headline}</span>
                    {heroCampaign.body ? <span className="ml-2 text-[#f8f5ef]/70">{heroCampaign.body}</span> : null}
                  </p>
                  {heroCampaign.ctaHref ? (
                    <Link href={heroCampaign.ctaHref} className="inline-flex items-center gap-1 font-semibold text-[#c3a068] hover:underline">
                      {heroCampaign.ctaLabel || "Learn more"} <ArrowRight className="size-3" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
            <HomeHero hero={hero} image={heroImage} />
          </div>
        );

      case "highlights":
        return <BusinessHighlights key={section.id} />;

      case "marquee": {
        const items = (section.body ? section.body.split(",") : defaultMarquee).map((item) => item.trim()).filter(Boolean);
        return (
          <div key={section.id} className="overflow-hidden border-b border-ink/7 bg-[#fffdf9] py-4">
            <div className="flex w-max animate-marquee items-center gap-10">
              {[...items, ...items].map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-10 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-ink/38">
                  {item}
                  <span className="size-1 rounded-full bg-gold" />
                </span>
              ))}
            </div>
          </div>
        );
      }

      case "categories":
        return <ExploreCategories key={section.id} categories={categories.filter((category) => categoryWithProducts.has(category.id))} />;

      case "featured":
        return (
          <section key={section.id} className="bg-[#fffdf9] py-20 md:py-28">
            <div className="container-lux">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <SectionHeading
                  eyebrow={section.eyebrow || "Signature pieces"}
                  title={section.title || "Featured gifts, chosen by our team"}
                  description={section.body || "A short edit of the pieces our clients return for — thoughtfully made, easy to brand and ready for bulk orders."}
                />
                <Link
                  href={section.ctaHref || "/products"}
                  className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-navy"
                  data-reveal
                >
                  {section.ctaLabel || "Shop all gifts"}
                  <span className="grid size-8 place-items-center rounded-full border border-navy/20 transition-colors group-hover:bg-navy group-hover:text-ivory">
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </div>
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {featured.map((product, index) => (
                  <div key={product.id} data-reveal>
                    <ProductCard product={product} whatsapp={settings.contact.whatsapp} priority={index < 2} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "customization":
      case "customizer":
        return <CustomizationShowcase key={section.id} />;

      case "hampers":
        return hampers.length > 0 ? <HamperShowcase key={section.id} hampers={hampers} /> : null;

      case "why-choose":
      case "why":
        return <WhyChoose key={section.id} stats={settings.stats} />;

      case "process":
      case "how":
        return <HowItWorks key={section.id} contactEmail={settings.contact.email} />;

      case "testimonials":
        if (testimonials.length === 0) return null;
        return (
          <section key={section.id} className="bg-[#fffdf9] py-20">
            <div className="container-lux">
              <SectionHeading align="center" eyebrow={section.eyebrow || "Client words"} title={section.title || "Trusted for the moments that matter"} />
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
        );

      case "enquiry":
      case "cta":
        return (
          <section key={section.id} className="relative overflow-hidden bg-navy py-20 md:py-24" id="enquiry">
            <div className="pointer-events-none absolute -left-32 top-10 size-[30rem] rounded-full border border-ivory/6" />
            <div className="container-lux relative grid items-center gap-12 lg:grid-cols-[1fr_1.02fr]">
              <div data-reveal>
                <span className="eyebrow !text-gold-light">{section.eyebrow || "Corporate enquiry"}</span>
                <h2 className="display mt-5 text-[clamp(2.3rem,4.5vw,3.7rem)] text-ivory">
                  {section.title || "Let’s make your next gift unforgettable."}
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/60">
                  {section.body || "Share the occasion, quantity and budget. We will come back with a considered proposal, samples where needed, and clear timelines."}
                </p>
                <div className="relative mt-10 hidden max-w-md sm:block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-ivory/10">
                    <Image src={section.imageUrl || "/uploads/products/gift-bags.jpg"} alt="A curated corporate gift hamper" fill sizes="420px" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/60 to-transparent" />
                  </div>
                </div>
                <div className="mt-10 flex flex-wrap gap-8 text-ivory/60">
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-[0.16em] text-gold/80">Call</p>
                    <a href={`tel:${settings.contact.phoneHref}`} className="mt-1 block text-sm hover:text-ivory">{settings.contact.phone}</a>
                  </div>
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-[0.16em] text-gold/80">Email</p>
                    <a href={`mailto:${settings.contact.email}`} className="mt-1 block text-sm hover:text-ivory">{settings.contact.email}</a>
                  </div>
                </div>
              </div>
              <div data-reveal>
                <EnquiryForm products={products} customizationOptions={customizationOptions} whatsapp={settings.contact.whatsapp} sourcePage="/" title="Request a corporate quotation" />
              </div>
            </div>
          </section>
        );

      case "custom":
        return (
          <section key={section.id} className="bg-[#fffdf9] py-16 md:py-20">
            <div className="container-lux max-w-3xl text-center">
              <SectionHeading align="center" eyebrow={section.eyebrow || undefined} title={section.title || "A section"} description={section.body || undefined} />
              {section.imageUrl ? (
                <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-xl">
                  <Image src={section.imageUrl} alt={section.title || ""} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                </div>
              ) : null}
              {section.ctaLabel && section.ctaHref ? (
                <Link href={section.ctaHref} className="btn-base btn-navy mt-8 inline-flex">{section.ctaLabel}</Link>
              ) : null}
            </div>
          </section>
        );

      default:
        return null;
    }
  }

  return <ScrollReveal>{enabled.map(renderSection)}</ScrollReveal>;
}
