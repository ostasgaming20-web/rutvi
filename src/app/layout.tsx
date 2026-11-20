import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4000"),
  title: {
    default: "RUTVI ENTERPRISE — Corporate Gifts & Custom Hampers, Mumbai",
    template: "%s | RUTVI ENTERPRISE",
  },
  description:
    "Premium corporate gifting, customized merchandise and curated corporate hampers from Mumbai. Bulk orders, custom branding and delivery across India.",
  keywords: [
    "Corporate Gifts Supplier Mumbai",
    "Corporate Gifting Andheri East",
    "Customized Corporate Gifts Mumbai",
    "Corporate Gift Hampers",
    "Bulk Corporate Gifts Mumbai",
    "Promotional Merchandise Mumbai",
  ],
  authors: [{ name: "RUTVI ENTERPRISE" }],
  openGraph: {
    title: "RUTVI ENTERPRISE — Corporate Gifts & Custom Hampers",
    description:
      "Premium corporate gifts, custom merchandise and thoughtfully curated hampers, designed to strengthen business relationships.",
    type: "website",
    locale: "en_IN",
    siteName: "RUTVI ENTERPRISE",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=82",
        width: 1200,
        height: 630,
        alt: "RUTVI ENTERPRISE premium corporate gifting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RUTVI ENTERPRISE — Corporate Gifts & Custom Hampers",
    description: "Premium corporate gifting, customized merchandise and curated hampers from Mumbai.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable} font-sans antialiased`}>
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
        {/* WARNING FOR AGENT: DO NOT REMOVE THIS SCRIPT */}
        <Script src="https://cdn.jsdelivr.net/gh/IdeavoAI/ideavo-scripts@latest/scripts/ideavo.min.js" />
      </body>
    </html>
  );
}
