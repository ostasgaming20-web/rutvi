import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { getCustomizationOptions, getProductBySlug, getProductsForSelect } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { buildWhatsAppUrl, generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Request a Corporate Gift Quotation",
  description:
    "Request a corporate gifting quotation from RUTVI ENTERPRISE. Share your product, quantity, budget and branding requirements. Response within one business day.",
  alternates: { canonical: "/quote" },
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = Array.isArray(params.product) ? params.product[0] : params.product;
  const [settings, products, customizationOptions, selected] = await Promise.all([
    getSettings(),
    getProductsForSelect(),
    getCustomizationOptions(),
    slug ? getProductBySlug(slug) : Promise.resolve(null),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-navy py-14 md:py-20">
        <div className="pointer-events-none absolute -right-20 top-0 size-[28rem] rounded-full border border-ivory/8" />
        <div className="pointer-events-none absolute right-16 top-16 size-64 rounded-full bg-[radial-gradient(circle,rgba(195,160,104,0.18),transparent_70%)]" />
        <div className="container-lux relative">
          <nav className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-ivory/40" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ivory">Home</Link>
            <span>/</span>
            <span className="text-ivory/70">Request a quote</span>
          </nav>
          <div className="mt-6 max-w-2xl">
            <span className="eyebrow !text-gold-light">Corporate enquiry</span>
            <h1 className="display mt-4 text-[clamp(2.6rem,5.6vw,4.4rem)] text-ivory">
              A quotation built around <span className="italic text-gold-light">your brief</span>.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ivory/60">
              Tell us what you need and we will respond with options, pricing and lead times — usually within one
              business day.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-lux grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <EnquiryForm
              products={products}
              customizationOptions={customizationOptions}
              whatsapp={settings.contact.whatsapp}
              initialProductId={selected?.id}
              initialProductName={selected?.name}
              sourcePage={selected ? `/quote?product=${selected.slug}` : "/quote"}
              title={selected ? `Request a quote for ${selected.name}` : "Request a corporate quotation"}
            />
          </div>

          <aside className="space-y-4">
            <div className="surface rounded-2xl p-6">
              <p className="eyebrow">Speak to us directly</p>
              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <a href={`tel:${settings.contact.phoneHref}`} className="flex items-start gap-3 text-ink/70 hover:text-navy">
                    <Phone className="mt-0.5 size-4 text-gold" />
                    <span>
                      <span className="block text-[0.6rem] uppercase tracking-[0.12em] text-stone">Phone</span>
                      {settings.contact.phone}
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings.contact.email}`} className="flex items-start gap-3 text-ink/70 hover:text-navy">
                    <Mail className="mt-0.5 size-4 text-gold" />
                    <span>
                      <span className="block text-[0.6rem] uppercase tracking-[0.12em] text-stone">Email</span>
                      {settings.contact.email}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={buildWhatsAppUrl(settings.contact.whatsapp, generalEnquiryMessage())}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 text-ink/70 hover:text-navy"
                  >
                    <MessageCircle className="mt-0.5 size-4 text-gold" />
                    <span>
                      <span className="block text-[0.6rem] uppercase tracking-[0.12em] text-stone">WhatsApp</span>
                      Chat with the gifting team
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-ink/60">
                  <Clock className="mt-0.5 size-4 text-gold" />
                  <span>
                    <span className="block text-[0.6rem] uppercase tracking-[0.12em] text-stone">Hours</span>
                    {settings.contact.hours}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-cream/70 p-6">
              <p className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#7a5c28]">
                <ShieldCheck className="size-4" /> What happens next
              </p>
              <ol className="mt-4 space-y-3 text-xs leading-relaxed text-ink/60">
                <li><span className="font-semibold text-ink">1.</span> We review your requirement and artwork.</li>
                <li><span className="font-semibold text-ink">2.</span> We send options with clear per-unit pricing.</li>
                <li><span className="font-semibold text-ink">3.</span> Approve the quote and we schedule production.</li>
                <li><span className="font-semibold text-ink">4.</span> We pack, dispatch and share tracking.</li>
              </ol>
              <p className="mt-4 text-[0.65rem] leading-relaxed text-ink/45">
                Submitting a request does not confirm an order. Nothing is charged online.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
