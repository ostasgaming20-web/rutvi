import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/db/schema";
import { SectionHeading } from "@/components/site/section-heading";

const featuredSlugs = [
  "corporate-gift-sets",
  "customized-pens",
  "diaries-notebooks",
  "bottles-mugs",
  "laptop-bags",
  "tech-accessories",
  "promotional-merchandise",
  "trophies-awards",
  "employee-welcome-kits",
  "executive-hampers",
];

export function ExploreCategories({ categories }: { categories: Category[] }) {
  const ordered = featuredSlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter(Boolean) as Category[];
  const list = ordered.length >= 8 ? ordered : categories.slice(0, 10);
  const mosaic = list.length >= 8;

  return (
    <section className="relative py-20 md:py-28" id="categories">
      <div className="container-lux">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Explore the collection"
            title={
              <>
                Gifts for every <span className="italic text-navy">relationship</span>
              </>
            }
            description="From onboarding kits to festive hampers, each collection is built around a different moment in your business."
          />
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase text-navy"
            data-reveal
          >
            View all products
            <span className="grid size-8 place-items-center rounded-full border border-navy/20 transition-colors group-hover:bg-navy group-hover:text-ivory">
              <ArrowUpRight className="size-3.5" />
            </span>
          </Link>
        </div>

        <div className={`mt-12 grid grid-cols-2 gap-3 md:gap-4 ${mosaic ? "md:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-5"}`}>
          {list.map((category, index) => {
            const href = category.kind === "hamper" ? "/hampers" : `/products?category=${category.slug}`;
            const large = mosaic && (index === 0 || index === 5);
            return (
              <Link
                key={category.id}
                href={href}
                className={`group relative overflow-hidden rounded-xl bg-navy ${large ? "col-span-2 row-span-2 aspect-[4/5] md:aspect-auto" : "aspect-[4/5]"}`}
                data-reveal
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                    className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_0%,#1c3455_0%,#0d1f3c_55%,#0a172b_100%)]">
                    <div className="absolute inset-0 opacity-[0.5] [background-image:linear-gradient(rgba(201,164,104,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(201,164,104,0.16)_1px,transparent_1px)] [background-size:34px_34px]" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span
                        className={`grid place-items-center rounded-full border border-gold/35 text-gold/70 transition-transform duration-[1100ms] ease-out group-hover:scale-105 ${
                          large ? "size-24" : "size-14"
                        }`}
                      >
                        <Image
                          src="/brand/rutvi-mark.png"
                          alt=""
                          width={256}
                          height={256}
                          sizes={large ? "96px" : "56px"}
                          className={`object-contain opacity-90 ${large ? "size-14" : "size-8"}`}
                        />
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/95 via-[#0b1526]/45 to-[#0b1526]/5 transition-opacity duration-500 group-hover:from-[#0b1526]/95 group-hover:via-[#0b1526]/35" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#081426] via-[#081426]/85 to-transparent p-4 pt-10 md:p-5 md:pt-12">
                  <div>
                    <p className="text-[0.55rem] font-medium tracking-[0.2em] uppercase text-gold-light/80">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className={`mt-1 font-medium text-ivory ${large ? "text-xl md:text-2xl" : "text-sm md:text-base"}`}>
                      {category.name}
                    </h3>
                  </div>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ivory/25 text-ivory opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
