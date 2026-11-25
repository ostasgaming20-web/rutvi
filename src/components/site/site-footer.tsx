import Link from "next/link";
import { ArrowUpRight, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import type { ContactSettings, FooterSettings } from "@/lib/settings";

const defaultLinks = [
  { label: "Products", href: "/products" },
  { label: "Customize Your Gift", href: "/customize" },
  { label: "Hampers & Gift Sets", href: "/hampers" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Request a Quote", href: "/quote" },
];

export function SiteFooter({
  contact,
  footer,
  links = defaultLinks,
}: {
  contact: ContactSettings;
  footer: FooterSettings;
  links?: { label: string; href: string }[];
}) {
  return (
    <footer className="relative overflow-hidden bg-navy text-ivory">
      <div className="pointer-events-none absolute -right-32 -top-32 size-[34rem] rounded-full border border-ivory/8" />
      <div className="pointer-events-none absolute -right-16 -top-16 size-[22rem] rounded-full border border-gold/20" />
      <div className="container-lux relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo variant="light" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/60">{footer.tagline}</p>
            <div className="mt-7 flex items-center gap-3">
              <a
                href={contact.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid size-10 place-items-center rounded-full border border-ivory/15 transition-colors hover:border-gold hover:text-gold"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="grid size-10 place-items-center rounded-full border border-ivory/15 transition-colors hover:border-gold hover:text-gold"
              >
                <Linkedin className="size-4" />
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-xs tracking-[0.12em] uppercase text-ivory/70 hover:text-gold"
              >
                WhatsApp us
              </a>
            </div>
          </div>

          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.24em] uppercase text-gold">Explore</p>
            <ul className="mt-5 space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ivory/65 transition-colors hover:text-ivory">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.24em] uppercase text-gold">Visit & contact</p>
            <ul className="mt-5 space-y-4 text-sm text-ivory/65">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold/80" />
                <span className="leading-relaxed">{contact.address}</span>
              </li>
              <li>
                <a href={`tel:${contact.phoneHref}`} className="flex items-center gap-3 hover:text-ivory">
                  <Phone className="size-4 shrink-0 text-gold/80" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-ivory">
                  <Mail className="size-4 shrink-0 text-gold/80" />
                  {contact.email}
                </a>
              </li>
              <li className="pt-1 text-xs text-ivory/45">{contact.hours}</li>
            </ul>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-gold hover:text-gold-light"
            >
              Get directions <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ivory/10 pt-6 text-[0.7rem] text-ivory/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} RUTVI ENTERPRISE. All rights reserved.</p>
          <p>{footer.note}</p>
          <Link href="/admin" className="transition-colors hover:text-ivory/70">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
