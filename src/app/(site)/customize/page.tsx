import type { Metadata } from "next";
import Link from "next/link";
import { Clock, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { getCustomizationOptions, getProductsForSelect } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { GiftCustomizer } from "@/components/site/gift-customizer";

export const metadata: Metadata = {
  title: "Customize Your Corporate Gift",
  description:
    "Build a customised corporate gift in eight steps: choose a product, colour, branding, packaging, quantity and budget. Upload your logo and request a quotation.",
  alternates: { canonical: "/customize" },
};

export default async function CustomizePage() {
  const [products, customizationOptions, settings] = await Promise.all([
    getProductsForSelect(),
    getCustomizationOptions(),
    getSettings(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/8 bg-[radial-gradient(100%_100%_at_80%_0%,#fbf6ec,#f1e9da)] py-14 md:py-20">
        <div className="pointer-events-none absolute -left-24 top-10 size-80 rounded-full border border-gold/20" />
        <div className="container-lux relative">
          <nav className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy">Home</Link>
            <span>/</span>
            <span className="text-ink/70">Customize</span>
          </nav>
          <div className="mt-6 max-w-3xl">
            <span className="eyebrow">The gift customiser</span>
            <h1 className="display mt-4 text-[clamp(2.6rem,5.6vw,4.4rem)] text-ink">
              Build a gift that carries <span className="italic text-navy">your brand</span>.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/58">
              Choose the product, colour, branding and packaging. See it in 3D, then send the full configuration to our
              team for a quotation. No payment is taken online.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-[0.65rem] uppercase tracking-[0.1em] text-ink/50">
            <span className="inline-flex items-center gap-2"><Sparkles className="size-4 text-gold" /> Live 3D preview</span>
            <span className="inline-flex items-center gap-2"><PackageCheck className="size-4 text-gold" /> Sample on request</span>
            <span className="inline-flex items-center gap-2"><Clock className="size-4 text-gold" /> Quote in 1 business day</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-gold" /> Your artwork stays private</span>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-lux">
          <GiftCustomizer
            products={products}
            customizationOptions={customizationOptions}
            whatsapp={settings.contact.whatsapp}
          />
        </div>
      </section>

      <section className="border-t border-ink/8 bg-[#fffdf9] py-12">
        <div className="container-lux grid gap-6 md:grid-cols-3">
          {[
            { title: "Artwork check", text: "We review resolution, colours and placement before production." },
            { title: "Physical sample", text: "Request a pre-production sample for large orders." },
            { title: "One point of contact", text: "From brief to delivery, you deal with the same team." },
          ].map((item) => (
            <div key={item.title} className="border-l border-gold/40 pl-4">
              <h2 className="text-sm font-semibold text-ink">{item.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink/55">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
