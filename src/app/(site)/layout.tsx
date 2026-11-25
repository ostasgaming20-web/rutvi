import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getCategoriesWithProducts } from "@/lib/queries";
import { getSettings, brandingStyle } from "@/lib/settings";
import { getNavigation, getAnnouncement, isPreviewMode } from "@/lib/content";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { AnalyticsBeacon } from "@/components/site/analytics-beacon";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: `${settings.branding.siteName} — ${settings.branding.tagline}`,
      template: settings.seo.titleTemplate,
    },
    description: settings.hero.description,
    robots: settings.seo.indexSite ? undefined : { index: false, follow: false },
    icons: settings.branding.faviconUrl ? { icon: settings.branding.faviconUrl } : undefined,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, allCategories, categoryWithProducts, navItems, footerItems, announcement, preview] = await Promise.all([
    getSettings(),
    getCategories(),
    getCategoriesWithProducts(),
    getNavigation("header"),
    getNavigation("footer"),
    getAnnouncement(),
    isPreviewMode(),
  ]);
  const categories = allCategories.filter((category) => categoryWithProducts.has(category.id));

  if ((settings.business.maintenanceMode || !settings.business.siteVisible) && !preview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1f3c] px-6 text-center text-[#f8f5ef]">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[#c3a068]">
          {settings.branding.siteName}
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight md:text-5xl">
          {settings.business.maintenanceMode ? "We’ll be back shortly." : "Our collection is being updated."}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[#f8f5ef]/60">
          {settings.business.maintenanceMessage}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
          <a href={`tel:${settings.contact.phoneHref}`} className="rounded-full border border-[#f8f5ef]/20 px-5 py-2.5 hover:border-[#c3a068]">
            {settings.contact.phone}
          </a>
          <a href={`mailto:${settings.contact.email}`} className="rounded-full bg-[#c3a068] px-5 py-2.5 font-semibold text-[#14161a]">
            Email us
          </a>
        </div>
        <Link href="/admin/login" className="mt-10 text-[0.6rem] uppercase tracking-[0.2em] text-[#f8f5ef]/30 hover:text-[#f8f5ef]/60">
          Staff sign in
        </Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.business.businessName,
    description: settings.hero.description,
    telephone: settings.contact.phone,
    email: settings.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact.address,
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    openingHours: "Mo-Sa 10:00-19:00",
    areaServed: "India",
    priceRange: "₹₹",
  };

  return (
    <div className="flex min-h-screen flex-col" style={brandingStyle(settings.branding)}>
      <SiteHeader
        categories={categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug }))}
        contact={settings.contact}
        navItems={navItems.map((item) => ({ id: item.id, label: item.label, href: item.href, badge: item.badge }))}
        announcement={announcement}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        contact={settings.contact}
        footer={settings.footer}
        links={footerItems.map((item) => ({ label: item.label, href: item.href }))}
      />
      <WhatsAppFloat phone={settings.contact.whatsapp} />
      <AnalyticsBeacon type="page_view" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
