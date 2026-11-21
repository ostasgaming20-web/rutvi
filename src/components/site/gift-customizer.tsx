"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Paperclip,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { formatINR } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const GiftBoxPreview = dynamic(() => import("@/components/three/gift-box-preview"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-[0.6rem] uppercase tracking-[0.2em] text-stone">Preparing preview…</div>
  ),
});

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

type CustomizationOption = {
  id: number;
  name: string;
  slug: string;
  priceNote: string | null;
  description: string | null;
};

const steps = [
  "Product",
  "Colour",
  "Branding",
  "Packaging",
  "Quantity",
  "Budget",
  "Artwork",
  "Review",
];

const boxColours = ["Navy", "Ivory", "Charcoal", "Sand", "Blush", "Olive", "Cognac"];
const ribbonColours = ["Gold", "Navy", "Ivory", "Burgundy", "Black"];
const packagingStyles = [
  { name: "Signature rigid box", note: "Magnetic close, foam insert, satin ribbon" },
  { name: "Kraft presentation box", note: "Recycled board, printed sleeve" },
  { name: "Reusable canvas crate", note: "Fabric handles, printed belly band" },
  { name: "Suede-lined trunk", note: "Premium clasp, letterpress card" },
  { name: "No packaging", note: "Products supplied individually" },
];
const budgetOptions = ["Under ₹1,000", "₹1,000 – ₹2,500", "₹2,500 – ₹5,000", "₹5,000 – ₹10,000", "₹10,000+"];

export function GiftCustomizer({
  products,
  customizationOptions,
  whatsapp,
}: {
  products: ProductOption[];
  customizationOptions: CustomizationOption[];
  whatsapp: string;
}) {
  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState<number | null>(products[0]?.id ?? null);
  const [colour, setColour] = useState(products[0]?.colors[0] ?? "Navy");
  const [branding, setBranding] = useState<string[]>([]);
  const [boxColour, setBoxColour] = useState("Navy");
  const [ribbonColour, setRibbonColour] = useState("Gold");
  const [packaging, setPackaging] = useState(packagingStyles[0].name);
  const [quantity, setQuantity] = useState<number | "">(products[0]?.minOrderQty ?? 25);
  const [budget, setBudget] = useState("");
  const [logoName, setLogoName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [reference, setReference] = useState("");

  const product = useMemo(() => products.find((item) => item.id === productId) ?? null, [productId, products]);

  useEffect(() => {
    if (!product) return;
    setColour(product.colors[0] ?? "Navy");
    setQuantity(product.minOrderQty);
  }, [product]);

  const filtered = products.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const progress = ((step + 1) / steps.length) * 100;

  function next() {
    setError("");
    if (step === 0 && !product) return setError("Select a product to continue.");
    if (step === 4 && (!quantity || Number(quantity) < (product?.minOrderQty ?? 1))) {
      return setError(`Quantity must be at least ${product?.minOrderQty ?? 1} for this product.`);
    }
    if (step === 7) {
      if (!name.trim() || !email.trim() || !phone.trim()) return setError("Add your name, email and phone so we can respond.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    }
    setStep((value) => Math.min(steps.length - 1, value + 1));
  }

  function back() {
    setError("");
    setStep((value) => Math.max(0, value - 1));
  }

  async function submit() {
    setStatus("submitting");
    setError("");
    const formData = new FormData();
    formData.set("name", name);
    formData.set("company", company);
    formData.set("email", email);
    formData.set("phone", phone);
    formData.set("type", "customizer");
    formData.set("sourcePage", "/customize");
    formData.set("quantity", String(quantity));
    formData.set("budget", budget);
    formData.set("message", instructions);
    if (product) {
      formData.set("productId", String(product.id));
      formData.set("productName", product.name);
    }
    formData.set(
      "customization",
      JSON.stringify({
        product: product?.name,
        productColour: colour,
        branding,
        boxColour,
        ribbonColour,
        packaging,
        budget,
      }),
    );
    const fileInput = document.getElementById("customizer-logo") as HTMLInputElement | null;
    if (fileInput?.files?.[0]) formData.set("logo", fileInput.files[0]);

    try {
      const response = await fetch("/api/enquiries", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) {
        setStatus("idle");
        setError(payload.message || "We could not submit your customisation. Please try again.");
        return;
      }
      setReference(payload.reference);
      setStatus("success");
    } catch {
      setStatus("idle");
      setError("Network error. Please try again or call +91 98699 94699.");
    }
  }

  if (status === "success") {
    return (
      <div className="surface mx-auto max-w-2xl rounded-2xl p-8 text-center md:p-12">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="display mt-5 text-4xl text-ink">Your customisation is saved.</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          Reference <span className="font-semibold text-navy">{reference}</span>. Our team will review the configuration
          and artwork, then send a quotation within one business day.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-xl bg-cream/60 p-4 text-left text-xs text-ink/60">
          <p className="font-semibold text-ink">{product?.name}</p>
          <p className="mt-1">{colour} · {branding.join(", ") || "Branding to discuss"} · {packaging}</p>
          <p className="mt-1">Quantity {quantity} · {budget || "Budget to discuss"}</p>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={buildWhatsAppUrl(whatsapp, `Hello RUTVI ENTERPRISE, I submitted customisation ${reference} and would like to discuss it.`)}
            target="_blank"
            rel="noreferrer"
            className="btn-base btn-navy"
          >
            <MessageCircle className="size-4" /> Discuss on WhatsApp
          </a>
          <button type="button" onClick={() => window.location.reload()} className="btn-base btn-ghost">
            <RotateCcw className="size-4" /> Start another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative overflow-hidden rounded-2xl border border-ink/8 bg-[radial-gradient(100%_100%_at_50%_0%,#fbf7ef,#eee3d1)]">
          <div className="h-[330px] w-full md:h-[420px]">
            <GiftBoxPreview boxColor={boxColour} ribbonColor={ribbonColour} logoText={company || name || "YOUR LOGO"} />
          </div>
          <div className="absolute left-4 top-4 rounded-full border border-ink/10 bg-ivory/80 px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-ink/55 backdrop-blur">
            Live 3D preview · drag to rotate
          </div>
          <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/50 bg-ivory/80 p-4 backdrop-blur-md">
            <p className="text-[0.55rem] uppercase tracking-[0.16em] text-stone">Your configuration</p>
            <p className="mt-1 text-sm font-semibold text-ink">{product?.name ?? "Select a product"}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem] text-ink/55">
              <span>Colour: {colour}</span>
              <span>Box: {boxColour}</span>
              <span>Ribbon: {ribbonColour}</span>
              <span>Qty: {quantity || "—"}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[0.62rem] text-stone">
          Preview is indicative. Final materials and colours are confirmed with a physical sample.
        </p>
      </div>

      <div className="surface rounded-2xl p-5 md:p-7">
        <div className="flex items-center justify-between">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold">
            Step {step + 1} of {steps.length}
          </p>
          <p className="text-[0.65rem] text-stone">{steps[step]}</p>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink/8">
          <div className="h-full rounded-full bg-navy transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 min-h-[22rem]">
          {step === 0 && (
            <div>
              <h2 className="display text-3xl text-ink">What would you like to gift?</h2>
              <p className="mt-2 text-xs text-ink/55">Choose a starting point. We can adjust contents later.</p>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products…"
                className="field mt-4"
                aria-label="Search products"
              />
              <div className="mt-4 grid max-h-[24rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProductId(item.id)}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                      productId === item.id ? "border-navy bg-navy/[0.04]" : "border-ink/10 hover:border-navy/40"
                    }`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-cream text-gold">
                      <Sparkles className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[0.78rem] font-medium text-ink">{item.name}</span>
                      <span className="mt-0.5 block text-[0.62rem] text-stone">
                        {formatINR(item.pricePaise)} · MOQ {item.minOrderQty}
                      </span>
                    </span>
                    {productId === item.id && <Check className="ml-auto size-4 shrink-0 text-navy" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && product && (
            <div>
              <h2 className="display text-3xl text-ink">Choose a product colour</h2>
              <p className="mt-2 text-xs text-ink/55">Available colours for {product.name}.</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {product.colors.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColour(option)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      colour === option ? "border-navy bg-navy/[0.04]" : "border-ink/10 hover:border-navy/40"
                    }`}
                  >
                    <span className="size-6 rounded-full border border-ink/10" style={{ background: swatch(option) }} />
                    <span className="text-[0.78rem] font-medium text-ink">{option}</span>
                    {colour === option && <Check className="ml-auto size-4 text-navy" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="display text-3xl text-ink">How should we brand it?</h2>
              <p className="mt-2 text-xs text-ink/55">Select every method you are considering. We will advise on the best fit.</p>
              <div className="mt-5 grid gap-2">
                {customizationOptions.map((option) => {
                  const active = branding.includes(option.name);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setBranding((current) =>
                          current.includes(option.name) ? current.filter((item) => item !== option.name) : [...current, option.name],
                        )
                      }
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                        active ? "border-navy bg-navy/[0.04]" : "border-ink/10 hover:border-navy/40"
                      }`}
                    >
                      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border ${active ? "border-navy bg-navy text-ivory" : "border-ink/20"}`}>
                        {active && <Check className="size-3" />}
                      </span>
                      <span>
                        <span className="block text-[0.8rem] font-medium text-ink">{option.name}</span>
                        <span className="mt-0.5 block text-[0.66rem] text-stone">
                          {option.priceNote ? `${option.priceNote} · ` : ""}
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="display text-3xl text-ink">Select packaging</h2>
              <p className="mt-2 text-xs text-ink/55">Choose a presentation style and preview it in 3D.</p>
              <div className="mt-4 grid gap-2">
                {packagingStyles.map((style) => (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => setPackaging(style.name)}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                      packaging === style.name ? "border-navy bg-navy/[0.04]" : "border-ink/10 hover:border-navy/40"
                    }`}
                  >
                    <span>
                      <span className="block text-[0.8rem] font-medium text-ink">{style.name}</span>
                      <span className="mt-0.5 block text-[0.65rem] text-stone">{style.note}</span>
                    </span>
                    {packaging === style.name && <Check className="size-4 text-navy" />}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="field-label">Box colour</p>
                  <div className="flex flex-wrap gap-2">
                    {boxColours.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setBoxColour(option)}
                        aria-label={`Box colour ${option}`}
                        className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${boxColour === option ? "border-navy" : "border-transparent"}`}
                        style={{ background: swatch(option) }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="field-label">Ribbon colour</p>
                  <div className="flex flex-wrap gap-2">
                    {ribbonColours.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRibbonColour(option)}
                        aria-label={`Ribbon colour ${option}`}
                        className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${ribbonColour === option ? "border-navy" : "border-transparent"}`}
                        style={{ background: swatch(option) }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="display text-3xl text-ink">How many gifts?</h2>
              <p className="mt-2 text-xs text-ink/55">
                Minimum order for {product?.name ?? "this product"} is {product?.minOrderQty ?? 1} pieces.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(product?.minOrderQty ?? 1, Number(value || 0) - 5))}
                  className="grid size-12 place-items-center rounded-full border border-ink/15 text-lg hover:border-navy"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  min={product?.minOrderQty ?? 1}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value === "" ? "" : Number(event.target.value))}
                  className="field text-center text-xl"
                  aria-label="Order quantity"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Number(value || 0) + 5)}
                  className="grid size-12 place-items-center rounded-full border border-ink/15 text-lg hover:border-navy"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {[25, 50, 100, 250, 500].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuantity(value)}
                    className={`rounded-full border px-3 py-1.5 text-[0.68rem] ${Number(quantity) === value ? "border-navy bg-navy text-ivory" : "border-ink/12 text-ink/60"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="display text-3xl text-ink">Budget per gift</h2>
              <p className="mt-2 text-xs text-ink/55">This helps us recommend the right contents and packaging.</p>
              <div className="mt-5 grid gap-2">
                {budgetOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBudget(option)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      budget === option ? "border-navy bg-navy/[0.04] text-navy" : "border-ink/10 text-ink/70 hover:border-navy/40"
                    }`}
                  >
                    {option}
                    {budget === option && <Check className="size-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="display text-3xl text-ink">Upload your artwork</h2>
              <p className="mt-2 text-xs text-ink/55">A logo or reference image helps us quote accurately. Optional at this stage.</p>
              <label
                htmlFor="customizer-logo"
                className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink/20 bg-cream/40 px-6 py-10 text-center transition-colors hover:border-navy/40"
              >
                <Paperclip className="size-6 text-gold" />
                <span className="text-sm font-medium text-ink/70">{logoName || "Choose a PNG, JPG, WebP or PDF"}</span>
                <span className="text-[0.65rem] text-stone">Maximum 5 MB · vector files welcome</span>
              </label>
              <input
                id="customizer-logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="sr-only"
                onChange={(event) => setLogoName(event.target.files?.[0]?.name ?? "")}
              />
              <div className="mt-5">
                <label className="field-label" htmlFor="instructions">
                  Special instructions
                </label>
                <textarea
                  id="instructions"
                  rows={4}
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  className="field resize-none"
                  placeholder="Deadline, delivery city, artwork notes…"
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="display text-3xl text-ink">Review & submit</h2>
              <p className="mt-2 text-xs text-ink/55">No payment is taken. We will send a quotation for approval.</p>

              <div className="mt-4 rounded-xl border border-ink/8 bg-cream/40 p-4 text-xs text-ink/60">
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <p><span className="text-stone">Product:</span> {product?.name}</p>
                  <p><span className="text-stone">Colour:</span> {colour}</p>
                  <p><span className="text-stone">Branding:</span> {branding.join(", ") || "To discuss"}</p>
                  <p><span className="text-stone">Packaging:</span> {packaging}</p>
                  <p><span className="text-stone">Box:</span> {boxColour} / {ribbonColour}</p>
                  <p><span className="text-stone">Quantity:</span> {quantity}</p>
                  <p><span className="text-stone">Budget:</span> {budget || "To discuss"}</p>
                  <p><span className="text-stone">Artwork:</span> {logoName || "Not uploaded"}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="cust-name">Full name *</label>
                  <input id="cust-name" value={name} onChange={(event) => setName(event.target.value)} className="field" autoComplete="name" />
                </div>
                <div>
                  <label className="field-label" htmlFor="cust-company">Company</label>
                  <input id="cust-company" value={company} onChange={(event) => setCompany(event.target.value)} className="field" autoComplete="organization" />
                </div>
                <div>
                  <label className="field-label" htmlFor="cust-email">Email *</label>
                  <input id="cust-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field" autoComplete="email" />
                </div>
                <div>
                  <label className="field-label" htmlFor="cust-phone">Phone *</label>
                  <input id="cust-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="field" autoComplete="tel" />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</p>}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/8 pt-5">
          <button type="button" onClick={back} disabled={step === 0} className="btn-base btn-ghost !min-h-10 !px-4 disabled:opacity-30">
            <ArrowLeft className="size-4" /> Back
          </button>
          {step < steps.length - 1 ? (
            <button type="button" onClick={next} className="btn-base btn-navy !min-h-10">
              Continue <ArrowRight className="size-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={status === "submitting"} className="btn-base btn-gold !min-h-10">
              {status === "submitting" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting…
                </>
              ) : (
                "Submit request"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function swatch(name: string) {
  const map: Record<string, string> = {
    Navy: "#13294b",
    Ivory: "#efe4d2",
    Charcoal: "#2b2a27",
    Sand: "#d9c6a7",
    Blush: "#d8b8ae",
    Olive: "#5c6047",
    Cognac: "#8a5a36",
    Gold: "#c3a068",
    Burgundy: "#6d2434",
    Black: "#1b1a17",
    White: "#f7f4ee",
    Sage: "#8a9478",
    Bone: "#e6ddc9",
    Clay: "#b07a5e",
    Natural: "#d8c6a4",
    Walnut: "#6b4a2f",
    Oak: "#b08a5c",
    Brass: "#b08d57",
    Midnight: "#101828",
    Clear: "#dfe7ea",
    Smoked: "#6a6a6a",
    Stone: "#a39a8b",
    Terracotta: "#b4694f",
    Maroon: "#5c1f2a",
    Custom: "#c3a068",
  };
  return map[name] ?? "#c3a068";
}
