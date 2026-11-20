import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { getCustomizationOptions, getProductsForSelect } from "@/lib/queries";
import { buildWhatsAppUrl, generalEnquiryMessage } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact & Visit Our Andheri East Studio",
  description:
    "Contact RUTVI ENTERPRISE for corporate gifting in Mumbai. Visit us on Kondivita Road, opposite Aqua Metro Station, MIDC, Andheri East. Call +91 98699 94699.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [settings, products, customizationOptions] = await Promise.all([
    getSettings(),
    getProductsForSelect(),
    getCustomizationOptions(),
  ]);

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(settings.contact.mapQuery)}&output=embed`;

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/8 bg-[radial-gradient(100%_100%_at_20%_0%,#fbf6ec,#f1e9da)] py-14 md:py-20">
        <div className="container-lux">
          <nav className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.12em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-navy">Home</Link>
            <span>/</span>
            <span className="text-ink/70">Contact</span>
          </nav>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <span className="eyebrow">Get in touch</span>
              <h1 className="display mt-4 text-[clamp(2.6rem,5.6vw,4.4rem)] text-ink">
                Let&apos;s plan something <span className="italic text-navy">thoughtful</span>.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/58">
                Have a gifting requirement? Call, email or visit our Andheri East studio. We work with teams across
                Mumbai and deliver throughout India.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href={buildWhatsAppUrl(settings.contact.whatsapp, generalEnquiryMessage())}
                target="_blank"
                rel="noreferrer"
                className="btn-base btn-navy"
              >
                <MessageCircle className="size-4" /> WhatsApp us
              </a>
              <a href={`tel:${settings.contact.phoneHref}`} className="btn-base btn-ghost">
                <Phone className="size-4" /> Call now
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-lux">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Phone,
                label: "Phone",
                value: settings.contact.phone,
                href: `tel:${settings.contact.phoneHref}`,
                note: "Mon–Sat, 10:00–19:00",
              },
              {
                icon: Mail,
                label: "Email",
                value: settings.contact.email,
                href: `mailto:${settings.contact.email}`,
                note: "Replies within one business day",
              },
              {
                icon: MessageCircle,
                label: "WhatsApp",
                value: "Chat with our team",
                href: buildWhatsAppUrl(settings.contact.whatsapp, generalEnquiryMessage()),
                note: "Share references and artwork",
              },
              {
                icon: Clock,
                label: "Business hours",
                value: settings.contact.hours,
                href: null,
                note: "Closed on Sundays",
              },
            ].map((item) => (
              <div key={item.label} className="surface rounded-xl p-5">
                <item.icon className="size-5 text-gold" strokeWidth={1.5} />
                <p className="mt-4 text-[0.58rem] uppercase tracking-[0.14em] text-stone">{item.label}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                    className="mt-1 block text-sm font-medium text-ink hover:text-navy"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-ink">{item.value}</p>
                )}
                <p className="mt-2 text-[0.65rem] text-stone">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <div className="overflow-hidden rounded-2xl border border-ink/8">
                <iframe
                  title="RUTVI ENTERPRISE location map"
                  src={mapSrc}
                  width="100%"
                  height="420"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block w-full"
                />
              </div>
              <div className="mt-4 flex flex-col gap-4 rounded-xl bg-cream/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-gold" />
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.14em] text-stone">Visit the studio</p>
                    <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink/70">{settings.contact.address}</p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.contact.mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-navy shrink-0 !min-h-10 !px-4 !text-[0.62rem]"
                >
                  Get directions
                </a>
              </div>
            </div>

            <EnquiryForm
              products={products}
              customizationOptions={customizationOptions}
              whatsapp={settings.contact.whatsapp}
              sourcePage="/contact"
              type="contact"
              showProduct={false}
              title="Send us a message"
            />
          </div>
        </div>
      </section>
    </>
  );
}
