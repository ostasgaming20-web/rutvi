import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/lib/db/schema";
import type { CatalogueFilters } from "@/lib/queries";

function buildHref(base: string, current: Record<string, string | undefined>, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...updates };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

const priceOptions = [
  { value: "under-1000", label: "Under ₹1,000" },
  { value: "1000-2500", label: "₹1,000 – ₹2,500" },
  { value: "2500-5000", label: "₹2,500 – ₹5,000" },
  { value: "above-5000", label: "₹5,000+" },
];

const sortOptions = [
  { value: "featured", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function CatalogueFiltersBar({
  base,
  categories,
  current,
  total,
}: {
  base: string;
  categories: Category[];
  current: CatalogueFilters & Record<string, string | undefined>;
  total: number;
}) {
  const currentParams = {
    q: current.q,
    category: current.category,
    price: current.price,
    sort: current.sort,
  };

  return (
    <div className="border-y border-ink/8 bg-[#fffdf9]">
      <div className="container-lux py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form action={base} className="flex w-full max-w-xl items-center gap-2">
            {current.category && <input type="hidden" name="category" value={current.category} />}
            {current.price && <input type="hidden" name="price" value={current.price} />}
            {current.sort && <input type="hidden" name="sort" value={current.sort} />}
            <div className="relative flex-1">
              <input
                type="search"
                name="q"
                defaultValue={current.q ?? ""}
                placeholder="Search by name or SKU…"
                className="field !min-h-11 pr-10"
                aria-label="Search products"
              />
              <SlidersHorizontal className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
            </div>
            <button type="submit" className="btn-base btn-navy !min-h-11 !px-5 !text-[0.62rem]">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.62rem] uppercase tracking-[0.12em] text-stone">{total} products</span>
            <div className="flex flex-wrap gap-1.5">
              {sortOptions.map((option) => (
                <Link
                  key={option.value}
                  href={buildHref(base, currentParams, { sort: option.value === "featured" ? undefined : option.value })}
                  className={`rounded-full border px-3 py-1.5 text-[0.62rem] transition-colors ${
                    (current.sort ?? "featured") === option.value
                      ? "border-navy bg-navy text-ivory"
                      : "border-ink/12 text-ink/60 hover:border-navy/40"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={buildHref(base, currentParams, { category: undefined })}
            className={`rounded-full border px-3 py-1.5 text-[0.66rem] transition-colors ${
              !current.category ? "border-gold bg-gold/15 text-[#6f5426]" : "border-ink/10 text-ink/60 hover:border-navy/30"
            }`}
          >
            All categories
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={buildHref(base, currentParams, { category: category.slug })}
              className={`rounded-full border px-3 py-1.5 text-[0.66rem] transition-colors ${
                current.category === category.slug
                  ? "border-gold bg-gold/15 text-[#6f5426]"
                  : "border-ink/10 text-ink/60 hover:border-navy/30"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/7 pt-3">
          <span className="text-[0.6rem] uppercase tracking-[0.12em] text-stone">Price</span>
          <Link
            href={buildHref(base, currentParams, { price: undefined })}
            className={`text-[0.64rem] ${!current.price ? "font-semibold text-navy" : "text-ink/50 hover:text-navy"}`}
          >
            Any
          </Link>
          {priceOptions.map((option) => (
            <Link
              key={option.value}
              href={buildHref(base, currentParams, { price: option.value })}
              className={`text-[0.64rem] ${current.price === option.value ? "font-semibold text-navy" : "text-ink/50 hover:text-navy"}`}
            >
              {option.label}
            </Link>
          ))}
          {(current.q || current.category || current.price || current.sort) && (
            <Link href={base} className="ml-auto text-[0.62rem] uppercase tracking-[0.08em] text-[#7a5c28] underline underline-offset-4">
              Clear all
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function Pagination({
  base,
  page,
  totalPages,
  params,
}: {
  base: string;
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === totalPages || Math.abs(value - page) <= 1,
  );

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={buildHref(base, params, { page: page > 2 ? String(page - 1) : undefined })}
        aria-disabled={page === 1}
        className={`grid size-10 place-items-center rounded-full border border-ink/12 ${page === 1 ? "pointer-events-none opacity-30" : "hover:border-navy"}`}
      >
        <ChevronLeft className="size-4" />
      </Link>
      {pages.map((value, index) => {
        const previous = pages[index - 1];
        return (
          <span key={value} className="flex items-center gap-2">
            {previous && value - previous > 1 && <span className="text-stone">…</span>}
            <Link
              href={buildHref(base, params, { page: value === 1 ? undefined : String(value) })}
              className={`grid size-10 place-items-center rounded-full border text-xs transition-colors ${
                value === page ? "border-navy bg-navy text-ivory" : "border-ink/12 text-ink/65 hover:border-navy"
              }`}
            >
              {value}
            </Link>
          </span>
        );
      })}
      <Link
        href={buildHref(base, params, { page: String(page + 1) })}
        aria-disabled={page === totalPages}
        className={`grid size-10 place-items-center rounded-full border border-ink/12 ${page === totalPages ? "pointer-events-none opacity-30" : "hover:border-navy"}`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
