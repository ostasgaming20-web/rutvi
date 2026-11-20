import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { getCatalogue, getCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/site/product-card";
import { CatalogueFiltersBar, Pagination } from "@/components/site/catalogue-filters";

export const metadata: Metadata = {
  title: "Corporate Gift Products & Promotional Merchandise",
  description:
    "Browse corporate gift sets, customized pens, diaries, drinkware, bags, tech accessories, awards and corporate hampers. Bulk quantities and custom branding available.",
  alternates: { canonical: "/products" },
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = single(params.q);
  const category = single(params.category);
  const price = single(params.price);
  const sort = single(params.sort);
  const page = Number(single(params.page) ?? "1") || 1;

  const [settings, categories, catalogue] = await Promise.all([
    getSettings(),
    getCategories(),
    getCatalogue({ q, category, price, sort, page, pageSize: 12 }),
  ]);

  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/8 bg-[radial-gradient(90%_120%_at_20%_0%,#fbf6ec,#f1e9da)] py-14 md:py-20">
        <div className="pointer-events-none absolute -right-24 top-0 size-80 rounded-full border border-gold/20" />
        <div className="container-lux relative">
          <nav className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy">Home</Link>
            <span>/</span>
            <span className="text-ink/70">Products</span>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-ink/70">{activeCategory.name}</span>
              </>
            )}
          </nav>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">The catalogue</span>
              <h1 className="display mt-3 max-w-2xl text-[clamp(2.5rem,5.4vw,4.2rem)] text-ink">
                {activeCategory ? activeCategory.name : "Corporate gifts, thoughtfully chosen"}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/58">
                {activeCategory?.description ||
                  "Every piece can be branded, packed and scaled to your requirement. Prices shown are indicative; request a quote for bulk pricing."}
              </p>
            </div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-stone">
              {catalogue.total} pieces · MOQ from 5
            </p>
          </div>
        </div>
      </section>

      <CatalogueFiltersBar
        base="/products"
        categories={categories}
        current={{ q, category, price, sort }}
        total={catalogue.total}
      />

      <section className="py-12 md:py-16">
        <div className="container-lux">
          {catalogue.products.length === 0 ? (
            <div className="mx-auto max-w-md py-20 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full border border-ink/10 bg-cream">
                <PackageSearch className="size-6 text-stone" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">No products match those filters</h2>
              <p className="mt-2 text-sm text-ink/55">
                Try a different search or clear the filters. We also source bespoke items on request.
              </p>
              <Link href="/products" className="btn-base btn-navy mt-6">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalogue.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsapp={settings.contact.whatsapp}
                  priority={index < 4}
                />
              ))}
            </div>
          )}

          <Pagination
            base="/products"
            page={catalogue.page}
            totalPages={catalogue.totalPages}
            params={{ q, category, price, sort }}
          />
        </div>
      </section>

      <section className="border-t border-ink/8 bg-[#fffdf9] py-14">
        <div className="container-lux flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="eyebrow">Can&apos;t find it?</p>
            <h2 className="display mt-3 text-3xl text-ink">We source bespoke gifts too.</h2>
            <p className="mt-2 max-w-xl text-sm text-ink/55">
              Share a reference, a budget and a deadline. Our team will find or build the right piece for your brand.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/customize" className="btn-base btn-navy">Customize a gift</Link>
            <Link href="/quote" className="btn-base btn-ghost">Request a quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}
