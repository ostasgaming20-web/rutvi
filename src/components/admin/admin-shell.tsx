"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeHelp,
  FileText,
  Gauge,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/enquiries", label: "Enquiries", icon: BadgeHelp },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Website settings", icon: Settings },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-gold/15 text-gold">
            <LayoutGrid className="size-4" />
          </span>
          <span>
            <span className="block text-[0.7rem] font-semibold tracking-[0.22em] text-ivory">RUTVI</span>
            <span className="block text-[0.48rem] tracking-[0.3em] text-ivory/35">ADMIN</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
        {nav.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.78rem] transition-colors",
                active ? "bg-ivory/10 text-ivory" : "text-ivory/55 hover:bg-ivory/5 hover:text-ivory/85",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ivory/10 p-4">
        <Link href="/" target="_blank" className="mb-3 flex items-center gap-2 px-1 text-[0.65rem] text-ivory/45 hover:text-ivory">
          View website <span aria-hidden="true">↗</span>
        </Link>
        <p className="truncate px-1 text-[0.65rem] text-ivory/35">{email}</p>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="mt-3 flex w-full items-center gap-2 rounded-lg border border-ivory/12 px-3 py-2 text-[0.7rem] text-ivory/60 transition-colors hover:border-ivory/25 hover:text-ivory"
        >
          <LogOut className="size-3.5" /> {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f2ea]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 bg-navy lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 bg-navy">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-ivory/60"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink/8 bg-[#f5f2ea]/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
            className="grid size-9 place-items-center rounded-lg border border-ink/10"
          >
            <Menu className="size-4" />
          </button>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-navy">RUTVI Admin</p>
          <span className="size-9" />
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
