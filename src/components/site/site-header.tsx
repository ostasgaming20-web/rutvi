"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, Phone, Search, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";
import type { ContactSettings } from "@/lib/settings";

type NavCategory = { id: number; name: string; slug: string };

const nav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products", dropdown: true },
  { label: "Customize Your Gift", href: "/customize" },
  { label: "Hampers & Gift Sets", href: "/hampers" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader({
  categories,
  contact,
}: {
  categories: NavCategory[];
  contact: ContactSettings;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    setSearchOpen(false);
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  }

  return (
    <>
      <div className="hidden bg-navy text-ivory/80 md:block">
        <div className="container-lux flex h-9 items-center justify-between text-[0.66rem] tracking-[0.14em] uppercase">
          <p>Premium corporate gifting · Mumbai · Delivery across India</p>
          <div className="flex items-center gap-6">
            <a href={`tel:${contact.phoneHref}`} className="inline-flex items-center gap-1.5 hover:text-gold-light">
              <Phone className="size-3" /> {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="hover:text-gold-light">
              {contact.email}
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-500",
          scrolled
            ? "border-ink/8 bg-ivory/92 shadow-[0_10px_40px_-24px_rgba(20,19,15,0.45)] backdrop-blur-xl"
            : "border-transparent bg-ivory/70 backdrop-blur-md",
        )}
      >
        <div className="container-lux flex h-[4.5rem] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
            {nav.map((item) =>
              item.dropdown ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1 py-2 text-[0.74rem] font-semibold tracking-[0.12em] uppercase transition-colors hover:text-navy",
                      pathname.startsWith("/products") ? "text-navy" : "text-ink/72",
                    )}
                  >
                    {item.label}
                    <ChevronDown className={cn("size-3 transition-transform", productsOpen && "rotate-180")} />
                  </Link>
                  <div
                    className={cn(
                      "absolute left-1/2 top-full w-[42rem] -translate-x-1/2 pt-3 transition-all duration-300",
                      productsOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
                    )}
                  >
                    <div className="surface overflow-hidden rounded-2xl p-6">
                      <div className="grid grid-cols-3 gap-x-8 gap-y-1">
                        {categories.slice(0, 12).map((category) => (
                          <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className="group flex items-center justify-between rounded-lg px-2 py-2.5 text-sm text-ink/72 transition-colors hover:bg-cream hover:text-navy"
                          >
                            {category.name}
                            <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-4">
                        <p className="text-xs text-stone">Looking for something bespoke?</p>
                        <Link href="/customize" className="text-xs font-semibold tracking-[0.1em] uppercase text-navy hover:text-gold">
                          Build your gift →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "py-2 text-[0.74rem] font-semibold tracking-[0.12em] uppercase transition-colors hover:text-navy",
                    pathname === item.href ? "text-navy" : "text-ink/72",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="grid size-10 place-items-center rounded-full text-ink/70 transition-colors hover:bg-cream hover:text-navy"
            >
              <Search className="size-[1.1rem]" />
            </button>
            <Link href="/quote" className="btn-base btn-navy hidden !min-h-10 !px-5 !text-[0.68rem] sm:inline-flex">
              Request a Quote
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="grid size-10 place-items-center rounded-full text-ink/80 transition-colors hover:bg-cream xl:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-ivory xl:hidden">
          <div className="container-lux flex h-[4.5rem] items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid size-11 place-items-center rounded-full border border-ink/10"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="container-lux flex-1 overflow-y-auto pb-10">
            <nav className="mt-4 flex flex-col" aria-label="Mobile">
              {nav.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between border-b border-ink/8 py-4 text-xl"
                >
                  <span className="display text-3xl">{item.label}</span>
                  <span className="text-xs text-stone">0{index + 1}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-8">
              <p className="eyebrow">Shop by category</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categories.slice(0, 12).map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="rounded-lg border border-ink/8 bg-white/60 px-3 py-2.5 text-xs text-ink/75"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-8 grid gap-3">
              <Link href="/quote" className="btn-base btn-navy w-full">
                Request a Quote
              </Link>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="btn-base btn-ghost w-full"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-navy/40 px-4 pt-24 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-ivory p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Search the collection</p>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="grid size-9 place-items-center rounded-full hover:bg-cream">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="mt-4 flex items-center gap-2 border-b border-ink/15 pb-2">
              <Search className="size-5 text-stone" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pens, diaries, hampers, SKU…"
                className="h-12 w-full bg-transparent text-lg outline-none placeholder:text-stone/70"
                aria-label="Search query"
              />
              <button type="submit" className="btn-base btn-navy !min-h-9 !px-4 !text-[0.65rem]">
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Corporate Gift Sets", "Customized Pens", "Diaries", "Hampers", "Welcome Kits"].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/products?q=${encodeURIComponent(term)}`);
                  }}
                  className="rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink/65 hover:border-navy hover:text-navy"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
