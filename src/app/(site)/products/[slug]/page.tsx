import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Box, Check, MessageCircle, PackageCheck, Ruler, Truck } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { formatINR } from "@/lib/format";
import { buildWhatsAppUrl, productEnquiryMessage } from "@/lib/whatsapp";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductCard } from "@/components/site/product-card";
import { AnalyticsBeacon } from "@/components/site/analytics-beacon";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription || product.description?.slice(0, 155),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | RUTVI ENTERPRISE`,
      description: product.shortDescription ?? undefined,
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);
  const whatsappHref = buildWhatsAppUrl(
    settings.contact.whatsapp,
    productEnquiryMessage({
      productName: product.name,
      quantity: product.minOrderQty,
      customization: product.customizationOptions.slice(0, 2).join(", "),
    }),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: "RUTVI ENTERPRISE" },
    category: product.categoryName,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.pricePaise ? (product.pricePaise / 100).toFixed(2) : undefined,
      availability: "https://schema.org/InStock",
      url: `/products/${product.slug}`,
      seller: { "@type": "Organization", name: "RUTVI ENTERPRISE" },
    },
  };

  return (
    <>
      <AnalyticsBeacon type="product_view" productId={product.id} path={`/products/${product.slug}`} />
      <section className="py-8 md:py-12">
        <div className="container-lux">
          <nav className="flex flex-wrap items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-navy">Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.categorySlug}`} className="hover:text-navy">{product.categoryName}</Link>
            <span>/</span>
            <span className="text-ink/70">{product.name}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
            <div>
              <ProductGallery images={product.images} name={product.name} />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: PackageCheck, label: "Bulk ready", value: `MOQ ${product.minOrderQty} pcs` },
                  { icon: Ruler, label: "Custom branding", value: product.customizationOptions[0] || "On request" },
                  { icon: Truck, label: "Delivery", value: "Pan-India" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-ink/8 bg-[#fffdf9] p-3">
                    <item.icon className="size-4 text-gold" />
                    <p className="mt-2 text-[0.55rem] uppercase tracking-[0.1em] text-stone">{item.label}</p>
                    <p className="mt-0.5 text-[0.72rem] font-medium text-ink/75">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#7a5c28]">
                  {product.categoryName}
                </span>
                {product.isFeatured && (
                  <span className="rounded-full border border-navy/15 bg-navy/5 px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-navy">
                    Signature
                  </span>
                )}
              </div>

              <h1 className="display mt-4 text-[clamp(2.3rem,4.6vw,3.5rem)] text-ink">{product.name}</h1>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">{product.shortDescription}</p>

              <div className="mt-6 flex items-end justify-between gap-4 border-y border-ink/10 py-4">
                <div>
                  <p className="text-[0.55rem] uppercase tracking-[0.14em] text-stone">Indicative price</p>
                  <p className="mt-1 text-2xl font-semibold text-navy">{formatINR(product.pricePaise)}</p>
                  <p className="mt-1 text-[0.65rem] text-stone">Excluding GST · bulk pricing on request</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.55rem] uppercase tracking-[0.14em] text-stone">Minimum order</p>
                  <p className="mt-1 text-lg font-medium text-ink">{product.minOrderQty} pcs</p>
                  <p className="mt-1 text-[0.65rem] text-stone">SKU {product.sku}</p>
                </div>
              </div>

              {product.colors.length > 0 && (
                <div className="mt-5">
                  <p className="field-label">Available colours</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span key={color} className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 px-3 py-1.5 text-[0.7rem] text-ink/70">
                        <span className="size-1.5 rounded-full bg-gold" />
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.customizationOptions.length > 0 && (
                <div className="mt-4">
                  <p className="field-label">Customisation available</p>
                  <div className="flex flex-wrap gap-2">
                    {product.customizationOptions.map((option) => (
                      <span key={option} className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 text-[0.68rem] text-ink/65">
                        <Check className="size-3 text-gold" /> {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-7 grid gap-2.5">
                <Link href={`/quote?product=${product.slug}`} className="btn-base btn-navy w-full">
                  Request a Quote
                </Link>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-base btn-ghost w-full">
                  <MessageCircle className="size-4" /> Enquire on WhatsApp
                </a>
                <Link href="/customize" className="text-center text-[0.65rem] uppercase tracking-[0.12em] text-ink/45 underline-offset-4 hover:text-navy hover:underline">
                  Or build a customised version
                </Link>
              </div>

              <div className="mt-7 space-y-4 border-t border-ink/10 pt-5 text-sm">
                <div>
                  <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink/70">Product details</h2>
                  <p className="mt-2 leading-relaxed text-ink/58">{product.description}</p>
                </div>

                {product.specifications.length > 0 && (
                  <div>
                    <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink/70">Specifications</h2>
                    <dl className="mt-2 divide-y divide-ink/7">
                      {product.specifications.map((spec) => (
                        <div key={spec.label} className="flex justify-between gap-6 py-2 text-[0.8rem]">
                          <dt className="text-stone">{spec.label}</dt>
                          <dd className="text-right font-medium text-ink/75">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {product.contents.length > 0 && (
                  <div>
                    <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink/70">What&apos;s inside</h2>
                    <ul className="mt-2 space-y-1.5">
                      {product.contents.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[0.82rem] text-ink/65">
                          <Box className="mt-0.5 size-3.5 shrink-0 text-gold" /> {item}
                        </li>
                      ))}
                    </ul>
                    {product.packaging && (
                      <p className="mt-3 rounded-lg bg-cream/60 p-3 text-[0.78rem] leading-relaxed text-ink/60">
                        <span className="font-semibold text-ink/75">Packaging: </span>
                        {product.packaging}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink/70">Ordering & delivery</h2>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/58">
                    Lead time is typically 7–14 working days after artwork approval, depending on quantity and branding.
                    Delivery is available across India. Quotations are valid for 15 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink/8 bg-[#fffdf9] py-16">
          <div className="container-lux">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">You may also like</p>
                <h2 className="display mt-3 text-3xl text-ink">More from {product.categoryName}</h2>
              </div>
              <Link href={`/products?category=${product.categorySlug}`} className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-navy">
                View all <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} whatsapp={settings.contact.whatsapp} />
              ))}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
