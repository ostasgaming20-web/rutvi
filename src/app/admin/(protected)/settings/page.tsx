import { desc } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
import { getSettings } from "@/lib/settings";
import { deleteTestimonial, saveTestimonial, saveWebsiteSettings } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[0.58rem] uppercase tracking-[0.12em] text-stone">
        {label}
      </label>
      <input
        name={name}
        aria-label={label}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="field !min-h-10 text-xs"
      />
    </div>
  );
}

function Area({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-[0.58rem] uppercase tracking-[0.12em] text-stone">
        {label}
      </label>
      <textarea name={name} aria-label={label} rows={rows} defaultValue={defaultValue ?? ""} className="field text-xs" />
    </div>
  );
}

export default async function AdminSettingsPage() {
  const [{ contact, hero, footer, stats }, quotes] = await Promise.all([
    getSettings(),
    db.select().from(testimonials).orderBy(desc(testimonials.sortOrder), desc(testimonials.id)),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold">Configuration</p>
        <h1 className="display mt-1 text-4xl text-ink">Website settings</h1>
        <p className="mt-1 text-sm text-ink/50">Changes publish to the live website as soon as you save.</p>
      </div>

      <form action={saveWebsiteSettings} className="space-y-5">
        <section className="surface rounded-xl p-5">
          <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Contact &amp; location</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Phone (display)" name="contact.phone" defaultValue={contact.phone} />
            <Field label="Phone (tel: link)" name="contact.phoneHref" defaultValue={contact.phoneHref} />
            <Field label="WhatsApp number" name="contact.whatsapp" defaultValue={contact.whatsapp} placeholder="919869994699" />
            <Field label="Sales email" name="contact.email" defaultValue={contact.email} type="email" />
            <div className="sm:col-span-2">
              <Area label="Street address" name="contact.address" defaultValue={contact.address} rows={2} />
            </div>
            <Field label="Google Maps search query" name="contact.mapQuery" defaultValue={contact.mapQuery} />
            <Field label="Working hours" name="contact.hours" defaultValue={contact.hours} />
            <Field label="Instagram URL" name="contact.instagram" defaultValue={contact.instagram} />
            <Field label="LinkedIn URL" name="contact.linkedin" defaultValue={contact.linkedin} />
          </div>
        </section>

        <section className="surface rounded-xl p-5">
          <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Homepage hero</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Eyebrow" name="hero.eyebrow" defaultValue={hero.eyebrow} />
            <Field label="Badge" name="hero.badge" defaultValue={hero.badge} />
            <div className="sm:col-span-2">
              <Field label="Headline" name="hero.headline" defaultValue={hero.headline} />
            </div>
            <div className="sm:col-span-2">
              <Area label="Description" name="hero.description" defaultValue={hero.description} />
            </div>
            <Field label="Primary CTA label" name="hero.primaryCta" defaultValue={hero.primaryCta} />
            <Field label="Secondary CTA label" name="hero.secondaryCta" defaultValue={hero.secondaryCta} />
          </div>
        </section>

        <section className="surface rounded-xl p-5">
          <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Footer &amp; highlights</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Area label="Footer tagline" name="footer.tagline" defaultValue={footer.tagline} rows={2} />
            <Area label="Footer note" name="footer.note" defaultValue={footer.note} rows={2} />
            <Field label="Stat · products" name="stats.products" defaultValue={stats.products} />
            <Field label="Stat · categories" name="stats.categories" defaultValue={stats.categories} />
            <Field label="Stat · hampers" name="stats.hampers" defaultValue={stats.hampers} />
            <Field label="Stat · delivery" name="stats.delivery" defaultValue={stats.delivery} />
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <SubmitButton className="btn-base btn-navy shadow-lg" pendingLabel="Publishing…">
            Save website settings
          </SubmitButton>
        </div>
      </form>

      <section className="surface rounded-xl p-5">
        <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Testimonials</h2>
        <p className="mt-1 text-[0.65rem] text-stone">
          Only published testimonials appear on the website. Leave this empty until you have real client quotes.
        </p>

        <div className="mt-4 space-y-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="rounded-lg border border-ink/8 bg-cream/20 p-4">
              <form action={saveTestimonial}>
                <input type="hidden" name="id" value={quote.id} />
                <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_5rem_5rem]">
                  <Field label="Customer name" name="customerName" defaultValue={quote.customerName} />
                  <Field label="Company" name="company" defaultValue={quote.company} />
                  <Field label="Rating (1–5)" name="rating" type="number" defaultValue={String(quote.rating)} />
                  <Field label="Sort order" name="sortOrder" type="number" defaultValue={String(quote.sortOrder)} />
                </div>
                <div className="mt-3">
                  <Area label="Quote" name="quote" defaultValue={quote.quote} rows={2} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-[0.65rem] text-ink/70">
                    <input type="checkbox" name="isPublished" defaultChecked={quote.isPublished} className="size-4 accent-[#0d1f3c]" />
                    Published on website
                  </label>
                  <SubmitButton className="btn-base btn-ghost !min-h-9 !px-3 !text-[0.6rem]" pendingLabel="Saving…">
                    Update
                  </SubmitButton>
                </div>
              </form>
              <form action={deleteTestimonial} className="mt-2 flex justify-end">
                <input type="hidden" name="id" value={quote.id} />
                <ConfirmSubmit
                  message={`Delete the testimonial from ${quote.customerName}?`}
                  className="inline-flex items-center gap-1.5 text-[0.6rem] font-medium text-red-600 hover:text-red-700"
                >
                  <Trash2 className="size-3" /> Delete testimonial from {quote.customerName}
                </ConfirmSubmit>
              </form>
            </div>
          ))}

          <form action={saveTestimonial} className="rounded-lg border border-dashed border-ink/15 p-4">
            <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink/60">Add testimonial</p>
            <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_5rem_5rem]">
              <Field label="Customer name" name="customerName" placeholder="Full name" />
              <Field label="Company" name="company" placeholder="Company (optional)" />
              <Field label="Rating (1–5)" name="rating" type="number" defaultValue="5" />
              <Field label="Sort order" name="sortOrder" type="number" defaultValue="0" />
            </div>
            <div className="mt-3">
              <Area label="Quote" name="quote" rows={2} />
            </div>
            <label className="mt-3 inline-flex items-center gap-2 text-[0.65rem] text-ink/70">
              <input type="checkbox" name="isPublished" className="size-4 accent-[#0d1f3c]" />
              Publish immediately
            </label>
            <div className="mt-3">
              <SubmitButton className="btn-base btn-gold !min-h-9 !px-3 !text-[0.6rem]" pendingLabel="Adding…">
                Add testimonial
              </SubmitButton>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
