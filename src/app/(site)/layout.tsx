import { getCategories } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "RUTVI ENTERPRISE",
    description:
      "Corporate gifting, customized corporate gifts, promotional merchandise and corporate hampers in Mumbai.",
    telephone: settings.contact.phone,
    email: settings.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kondivita Road, Opposite Aqua Metro Station, MIDC, Andheri East",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    openingHours: "Mo-Sa 10:00-19:00",
    areaServed: "India",
    priceRange: "₹₹",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        categories={categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug }))}
        contact={settings.contact}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter contact={settings.contact} footer={settings.footer} />
      <WhatsAppFloat phone={settings.contact.whatsapp} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
