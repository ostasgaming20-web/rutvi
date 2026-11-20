import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="grid min-h-screen bg-ivory lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,#1b3358,#0a1729_70%)]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 size-[30rem] rounded-full border border-ivory/8" />
        <div className="pointer-events-none absolute -left-10 bottom-10 size-[20rem] rounded-full border border-gold/20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div>
            <p className="text-[0.62rem] font-semibold tracking-[0.32em] uppercase text-gold">RUTVI ENTERPRISE</p>
            <p className="mt-2 text-[0.55rem] tracking-[0.36em] uppercase text-ivory/35">Corporate gifting · Mumbai</p>
          </div>
          <div>
            <h1 className="display max-w-md text-[clamp(2.6rem,4vw,4rem)] text-ivory">
              The gifting desk, <span className="italic text-gold-light">behind the scenes</span>.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/55">
              Manage the catalogue, respond to enquiries and prepare quotations — all in one place.
            </p>
          </div>
          <p className="text-[0.6rem] uppercase tracking-[0.16em] text-ivory/30">
            Kondivita Road · Andheri East · Mumbai
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <p className="text-[0.62rem] font-semibold tracking-[0.3em] uppercase text-navy">RUTVI ENTERPRISE</p>
            <p className="mt-1 text-[0.55rem] tracking-[0.28em] uppercase text-stone">Admin</p>
          </div>
          <h2 className="display mt-8 text-4xl text-ink lg:mt-0">Welcome back.</h2>
          <p className="mt-2 text-sm text-ink/55">Sign in to manage the RUTVI ENTERPRISE website.</p>
          <LoginForm />
          <p className="mt-8 text-center text-[0.65rem] text-stone">
            Access is limited to authorised administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
