"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MessageCircle, Paperclip, ShieldCheck } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type ProductOption = {
  id: number;
  name: string;
  slug: string;
  pricePaise: number | null;
  minOrderQty: number;
  colors: string[];
  customizationOptions: string[];
  productType: string;
};

type CustomizationOption = { id: number; name: string; slug: string };

const budgets = ["Under ₹1,000", "₹1,000 – ₹2,500", "₹2,500 – ₹5,000", "₹5,000+", "Not sure yet"];

export function EnquiryForm({
  products,
  customizationOptions,
  whatsapp,
  initialProductId,
  initialProductName,
  sourcePage = "/",
  compact = false,
  title = "Tell us about your gifting requirement",
  type = "quote",
  showProduct = true,
}: {
  products: ProductOption[];
  customizationOptions: CustomizationOption[];
  whatsapp: string;
  initialProductId?: number;
  initialProductName?: string;
  sourcePage?: string;
  compact?: boolean;
  title?: string;
  type?: "quote" | "contact";
  showProduct?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    setFieldErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("type", type);
    data.set("sourcePage", sourcePage);
    data.set("customization", JSON.stringify({ methods: selected }));
    const productId = data.get("productId");
    if (productId) {
      const product = products.find((item) => String(item.id) === String(productId));
      if (product) data.set("productName", product.name);
    }

    try {
      const response = await fetch("/api/enquiries", { method: "POST", body: data });
      const payload = await response.json();
      if (!response.ok) {
        setStatus("error");
        setError(payload.message || "We could not send your enquiry. Please try again.");
        setFieldErrors(payload.fieldErrors || {});
        return;
      }
      setReference(payload.reference);
      setStatus("success");
      setSelected([]);
      setFileName("");
      form.reset();
    } catch {
      setStatus("error");
      setError("Network error. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="surface rounded-2xl p-7 md:p-9">
        <div className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="display mt-5 text-3xl text-ink">Your enquiry is with us.</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          Reference <span className="font-semibold text-navy">{reference}</span>. Our gifting team will respond within one
          business day with options and pricing.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={buildWhatsAppUrl(
              whatsapp,
              `Hello RUTVI ENTERPRISE, I just submitted enquiry ${reference}. I would like to discuss it.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="btn-base btn-navy"
          >
            <MessageCircle className="size-4" /> Continue on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setFormKey((value) => value + 1);
            }}
            className="btn-base btn-ghost"
          >
            Submit another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} className="surface rounded-2xl p-5 md:p-7" noValidate>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-xs text-ink/50">No obligation. We reply with options and pricing.</p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.1em] text-ink/50 sm:inline-flex">
          <ShieldCheck className="size-3 text-gold" /> Private
        </span>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          {error}
        </p>
      )}

      <div className={`mt-5 grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <div>
          <label className="field-label" htmlFor="name">
            Full name *
          </label>
          <input id="name" name="name" autoComplete="name" className="field" placeholder="Your name" required />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="company">
            Company
          </label>
          <input id="company" name="company" autoComplete="organization" className="field" placeholder="Company name" />
        </div>
        <div>
          <label className="field-label" htmlFor="email">
            Work email *
          </label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" className="field" placeholder="you@company.com" required />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="phone">
            Phone *
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className="field" placeholder="+91 98765 43210" required />
          {fieldErrors.phone && <p className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>}
        </div>
        {showProduct && (
        <div>
          <label className="field-label" htmlFor="productId">
            Product or category
          </label>
          <select id="productId" name="productId" className="field" defaultValue={initialProductId ?? ""}>
            <option value="">{initialProductName ? `Selected: ${initialProductName}` : "Select a product"}</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="quantity">
              Quantity
            </label>
            <input id="quantity" name="quantity" type="number" min={1} inputMode="numeric" className="field" placeholder="100" />
          </div>
          <div>
            <label className="field-label" htmlFor="budget">
              Budget / gift
            </label>
            <select id="budget" name="budget" className="field" defaultValue="">
              <option value="">Select</option>
              {budgets.map((budget) => (
                <option key={budget} value={budget}>
                  {budget}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <span className="field-label">Customisation required</span>
        <div className="flex flex-wrap gap-2">
          {customizationOptions.map((option) => {
            const active = selected.includes(option.name);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  setSelected((current) =>
                    current.includes(option.name) ? current.filter((item) => item !== option.name) : [...current, option.name],
                  )
                }
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-[0.7rem] transition-colors ${
                  active ? "border-navy bg-navy text-ivory" : "border-ink/15 text-ink/65 hover:border-navy/50"
                }`}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <label className="field-label" htmlFor="message">
          Special instructions
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="field resize-none"
          placeholder="Occasion, delivery city, artwork notes, deadline…"
          maxLength={2000}
        />
      </div>

      <div className="mt-4">
        <label className="field-label" htmlFor="logo">
          Logo or reference image
        </label>
        <label
          htmlFor="logo"
          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-ink/20 bg-cream/40 px-4 py-3 text-xs text-ink/55 transition-colors hover:border-navy/40"
        >
          <span className="inline-flex items-center gap-2">
            <Paperclip className="size-4 text-gold" />
            {fileName || "Attach an image or PDF (max 5 MB)"}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-navy">Browse</span>
        </label>
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <button type="submit" disabled={status === "submitting"} className="btn-base btn-navy mt-6 w-full disabled:opacity-70">
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending your enquiry…
          </>
        ) : (
          "Submit enquiry"
        )}
      </button>
      <p className="mt-3 text-center text-[0.65rem] leading-relaxed text-ink/40">
        By submitting you agree to be contacted about this enquiry. We never share your details.
      </p>
    </form>
  );
}
