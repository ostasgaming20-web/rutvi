"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Eye, MessageCircle, X } from "lucide-react";
import type { ProductCardData } from "@/lib/queries";
import { formatINR } from "@/lib/format";
import { buildWhatsAppUrl, productEnquiryMessage } from "@/lib/whatsapp";

export function ProductCard({
  product,
  whatsapp,
  priority = false,
}: {
  product: ProductCardData;
  whatsapp: string;
  priority?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [quickView, setQuickView] = useState(false);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1100px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
    card.style.boxShadow = `${(-x * 18).toFixed(1)}px ${(22 + y * 10).toFixed(1)}px 50px -30px rgba(20,19,15,0.45)`;
  }

  function handleLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)";
    card.style.boxShadow = "";
  }

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="tilt-card group relative flex h-full flex-col overflow-hidden rounded-xl border border-ink/7 bg-[#fffdf9]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-cream">
          <Link href={`/products/${product.slug}`} aria-label={product.name} className="relative block size-full">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                priority={priority}
              />
            ) : (
              <div className="grid size-full place-items-center text-xs text-stone">Image coming soon</div>
            )}
          </Link>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.isFeatured && (
              <span className="rounded-full bg-ivory/90 px-2.5 py-1 text-[0.58rem] font-semibold tracking-[0.12em] uppercase text-navy backdrop-blur">
                Signature
              </span>
            )}
            {product.availability !== "in_stock" && (
              <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[0.58rem] font-semibold tracking-[0.12em] uppercase text-ivory">
                Made to order
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 flex translate-y-1 flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setQuickView(true)}
              aria-label={`Quick view ${product.name}`}
              className="grid size-9 place-items-center rounded-full bg-ivory/92 text-navy shadow-sm backdrop-blur transition-colors hover:bg-navy hover:text-ivory"
            >
              <Eye className="size-4" />
            </button>
            <a
              href={buildWhatsAppUrl(whatsapp, productEnquiryMessage({ productName: product.name, quantity: product.minOrderQty, customization: product.customizationOptions[0] }))}
              target="_blank"
              rel="noreferrer"
              aria-label={`Enquire about ${product.name} on WhatsApp`}
              className="grid size-9 place-items-center rounded-full bg-ivory/92 text-[#0f3d2e] shadow-sm backdrop-blur transition-colors hover:bg-[#0f3d2e] hover:text-ivory"
            >
              <MessageCircle className="size-4" />
            </a>
          </div>

          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Link
              href={`/quote?product=${product.slug}`}
              className="btn-base btn-gold w-full !min-h-10 !px-4 !text-[0.62rem]"
            >
              Request a Quote
            </Link>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-gold">{product.categoryName}</p>
          <h3 className="mt-1.5 text-[0.98rem] font-semibold leading-snug text-ink">
            <Link href={`/products/${product.slug}`} className="transition-colors hover:text-navy">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone">{product.shortDescription}</p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div>
              <p className="text-sm font-semibold text-navy">{formatINR(product.pricePaise)}</p>
              <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.08em] text-stone">
                MOQ {product.minOrderQty} pcs
              </p>
            </div>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-navy transition-colors hover:text-gold"
            >
              View <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {quickView && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/45 p-4 backdrop-blur-sm"
          onClick={() => setQuickView(false)}
          role="presentation"
        >
          <div
            className="relative grid w-full max-w-3xl overflow-hidden rounded-2xl bg-ivory shadow-2xl md:grid-cols-2"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
          >
            <button
              type="button"
              onClick={() => setQuickView(false)}
              aria-label="Close quick view"
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-ivory/90 text-ink shadow-sm hover:bg-navy hover:text-ivory"
            >
              <X className="size-4" />
            </button>
            <div className="relative aspect-square bg-cream">
              {product.image && (
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              )}
            </div>
            <div className="flex flex-col p-6 md:p-8">
              <p className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-gold">{product.categoryName}</p>
              <h3 className="display mt-2 text-3xl text-ink">{product.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone">{product.shortDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {product.colors.slice(0, 4).map((color) => (
                  <span key={color} className="rounded-full border border-ink/10 px-2.5 py-1 text-[0.65rem] text-ink/70">
                    {color}
                  </span>
                ))}
              </div>
              <dl className="mt-6 space-y-2 border-t border-ink/8 pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-stone">Price</dt>
                  <dd className="font-semibold text-navy">{formatINR(product.pricePaise)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone">Minimum order</dt>
                  <dd className="font-medium">{product.minOrderQty} pieces</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone">SKU</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>
              </dl>
              <div className="mt-auto grid gap-2 pt-6">
                <Link href={`/quote?product=${product.slug}`} className="btn-base btn-navy w-full">
                  Request a Quote
                </Link>
                <Link href={`/products/${product.slug}`} className="btn-base btn-ghost w-full">
                  View full details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
