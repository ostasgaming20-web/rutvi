import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, PackageCheck, Ribbon } from "lucide-react";
import { getCatalogue, getCategories, getCustomizationOptions, getProductsForSelect } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/site/product-card";
import { CatalogueFiltersBar, Pagination } from "@/components/site/catalogue-filters";
import { EnquiryForm } from "@/components/site/enquiry-form";

export const metadata: Metadata = {
  title: "Corporate Hampers & Premium Gift Sets",
  description:
    "Executive hampers, Diwali and New Year gift sets, employee welcome hampers and custom corporate hampers from Mumbai. Curated contents, branded packaging, bulk quantities.",
  alternates: { canonical: "/hampers" },
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HampersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = single(params.category);
  const q = single(params.q);
  const sort = single(params.sort);
  const price = single(params.price);
  const page = Number(single(params.page) ?? "1") || 1;

  const [settings, categories, catalogue, products, customizationOptions] = await Promise.all([
    getSettings(),
    getCategories("hamper"),
    getCatalogue({ kind: "hamper", category, q, sort, price, page, pageSize: 9 }),
    getProductsForSelect(),
    getCustomizationOptions(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        <Image
          src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=1600&q=82"
          alt="Premium corporate hamper with curated gifts"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#081426] via-[#081426]/85 to-[#081426]/30" />
        <div className="container-lux relative py-20 md:py-28">
          <span className="eyebrow !text-gold-light">Hampers & gift sets</span>
          <h1 className="display mt-5 max-w-2xl text-[clamp(2.7rem,6vw,4.8rem)] text-ivory">
            Gifts that arrive <span className="italic text-gold-light">beautifully</span>.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/65">
            Executive hampers, festive sets and employee welcome boxes, layered by hand and finished with your brand.
            Every hamper can be customised to your budget and audience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/customize" className="btn-base btn-gold">
              Build a custom hamper
            </Link>
            <Link href="#hamper-enquiry" className="btn-base btn-light">
              Request a quote
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[0.65rem] uppercase tracking-[0.12em] text-ivory/55">
            <span className="inline-flex items-center gap-2"><Gift className="size-4 text-gold" /> 7 hamper collections</span>
            <span className="inline-flex items-center gap-2"><Ribbon className="size-4 text-gold" /> Branded packaging</span>
            <span className="inline-flex items-center gap-2"><PackageCheck className="size-4 text-gold" /> MOQ from 10</span>
          </div>
        </div>
      </section>

      <CatalogueFiltersBar
        base="/hampers"
        categories={categories}
        current={{ q, category, price, sort }}
        total={catalogue.total}
      />

      <section className="py-12 md:py-16">
        <div className="container-lux">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.products.map((hamper, index) => (
              <ProductCard key={hamper.id} product={hamper} whatsapp={settings.contact.whatsapp} priority={index < 3} />
            ))}
          </div>
          <Pagination base="/hampers" page={catalogue.page} totalPages={catalogue.totalPages} params={{ q, category, price, sort }} />
        </div>
      </section>

      <section className="border-y border-ink/8 bg-[#f1ebdf] py-16">
        <div className="container-lux grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">Fully bespoke</p>
            <h2 className="display mt-4 text-[clamp(2.2rem,4.4vw,3.4rem)] text-ink">
              A hamper built around your <span className="italic text-navy">brief</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/58">
              Choose the box, ribbon, contents and card. We source, brand, pack and deliver — with a single point of
              contact and a clear per-unit price.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-ink/65 sm:grid-cols-2">
              {["Custom box and ribbon", "Curated or client-chosen contents", "Printed name cards", "Delivery to multiple offices"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-gold" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/customize" className="btn-base btn-navy mt-7">
              Start your custom hamper
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=82"
              alt="Custom corporate hamper packaging"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 rounded-xl bg-ivory/90 px-4 py-3 backdrop-blur">
              <p className="text-[0.55rem] uppercase tracking-[0.14em] text-stone">Made to order</p>
              <p className="text-sm font-medium text-navy">From 25 hampers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" id="hamper-enquiry">
        <div className="container-lux grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Hamper enquiry</p>
            <h2 className="display mt-4 text-[clamp(2.2rem,4.4vw,3.4rem)] text-ink">
              Tell us the occasion. We&apos;ll curate the rest.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/58">
              Share quantity, budget and delivery city. We will send a curated proposal with packaging options and a
              clear per-unit quotation.
            </p>
            <div className="mt-8 space-y-4 border-t border-ink/10 pt-6 text-sm text-ink/60">
              <p><span className="font-semibold text-ink">Call</span> · {settings.contact.phone}</p>
              <p><span className="font-semibold text-ink">Email</span> · {settings.contact.email}</p>
              <p><span className="font-semibold text-ink">Visit</span> · {settings.contact.address}</p>
            </div>
          </div>
          <EnquiryForm
            products={products}
            customizationOptions={customizationOptions}
            whatsapp={settings.contact.whatsapp}
            sourcePage="/hampers"
            title="Request a hamper quotation"
          />
        </div>
      </section>
    </>
  );
}
