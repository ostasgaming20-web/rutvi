"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, LogOut, Menu, Search, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { adminNav } from "@/components/admin/nav-config";

function Flash() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ok = params.get("ok");
    const error = params.get("error");
    if (ok) toast.success(ok);
    if (error) toast.error(error);
    if (ok || error) {
      params.delete("ok");
      params.delete("error");
      const query = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (query ? `?${query}` : ""));
    }
  }, []);
  return null;
}

export function AdminShell({
  children,
  email,
  roleLabel,
  allowed,
  siteName,
}: {
  children: React.ReactNode;
  email: string;
  roleLabel: string;
  allowed: string[];
  siteName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const groups = useMemo(
    () =>
      adminNav
        .map((group) => ({ ...group, items: group.items.filter((item) => allowed.includes(item.href)) }))
        .filter((group) => group.items.length > 0),
    [allowed],
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const activeItem = adminNav.flatMap((group) => group.items).find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0b0e13]">
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#c3a068] to-[#8f6f3c] text-[0.7rem] font-bold text-[#0b0e13]">
          R
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[0.7rem] font-semibold tracking-[0.18em] text-white">{siteName}</span>
          <span className="block text-[0.5rem] tracking-[0.28em] text-[#c3a068]">SUPER ADMIN PANEL</span>
        </span>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Admin">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1.5 text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-white/25">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.76rem] transition-all",
                      active
                        ? "bg-white/8 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                        : "text-white/50 hover:bg-white/4 hover:text-white/85",
                    )}
                  >
                    <item.icon className={cn("size-4 shrink-0", active ? "text-[#c3a068]" : "text-white/35 group-hover:text-white/60")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-[#c3a068]/15 px-1.5 py-0.5 text-[0.45rem] font-semibold uppercase tracking-wider text-[#c3a068]">
                        {item.badge}
                      </span>
                    )}
                    {active && <span className="size-1.5 rounded-full bg-[#c3a068]" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/6 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/4 px-3 py-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#1b3358] text-[0.6rem] font-semibold text-white">
            {email.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.65rem] text-white/80">{email}</p>
            <p className="flex items-center gap-1 text-[0.52rem] uppercase tracking-[0.12em] text-[#c3a068]">
              <ShieldCheck className="size-2.5" /> {roleLabel}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/8 px-2 py-2 text-[0.6rem] text-white/55 transition-colors hover:border-white/20 hover:text-white"
          >
            <ExternalLink className="size-3" /> Site
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/8 px-2 py-2 text-[0.6rem] text-white/55 transition-colors hover:border-red-400/40 hover:text-red-300"
          >
            <LogOut className="size-3" /> {signingOut ? "…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#14161a]">
      <Flash />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[15.5rem] lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-[16.5rem] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-2 top-4 z-10 grid size-8 place-items-center rounded-full text-white/60 hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-[15.5rem]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-black/6 bg-white/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open admin menu"
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-black/8 bg-white lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <div className="hidden items-center gap-1.5 text-[0.68rem] text-black/40 sm:flex">
              <span className="font-medium text-black/55">Admin</span>
              <ChevronRight className="size-3" />
              <span className="truncate font-medium text-[#14161a]">{activeItem?.label ?? "Overview"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="hidden items-center gap-1.5 rounded-lg border border-black/8 bg-white px-2.5 py-1.5 text-[0.65rem] text-black/45 transition-colors hover:border-black/20 hover:text-black sm:flex"
            >
              <Search className="size-3" /> Search products
            </Link>
            <Link
              href="/admin/enquiries?status=new"
              className="rounded-lg bg-[#0d1f3c] px-3 py-1.5 text-[0.62rem] font-semibold text-white transition-opacity hover:opacity-90"
            >
              New enquiries
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[88rem] p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
