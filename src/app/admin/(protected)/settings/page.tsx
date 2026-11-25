import { desc, isNotNull } from "drizzle-orm";
import { Building2, Globe, MessageSquareQuote, Save, ShieldAlert } from "lucide-react";
import { db } from "@/lib/db";
import { testimonials, websiteSettings } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { getDraftSettings } from "@/lib/settings";
import {
  saveBusinessSettings,
  saveContactSettings,
  publishContent,
  discardDraft,
  setPreviewMode,
} from "@/app/admin/content-actions";
import { saveTestimonial, deleteTestimonial } from "@/app/admin/actions";
import {
  PageHeader,
  Panel,
  Field,
  TextArea,
  Toggle,
  Tag,
  ButtonLink,
  EmptyState,
  Th,
  Td,
  TableWrap,
} from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { DraftBar } from "@/components/admin/draft-bar";
import { ConfirmAction } from "@/components/admin/confirm-action";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireCapability("settings.manage");
  const [settings, drafts, publishedRows, quotes] = await Promise.all([
    getDraftSettings(),
    db.select({ key: websiteSettings.key }).from(websiteSettings).where(isNotNull(websiteSettings.draftValue)),
    db
      .select({ publishedAt: websiteSettings.publishedAt, publishedBy: websiteSettings.publishedBy })
      .from(websiteSettings)
      .orderBy(desc(websiteSettings.publishedAt))
      .limit(1),
    db.select().from(testimonials).orderBy(testimonials.sortOrder, desc(testimonials.createdAt)),
  ]);

  const draftKeys = new Set(drafts.map((row) => row.key));
  const hasDraft = ["business", "contact"].some((key) => draftKeys.has(key));
  const lastPublished = publishedRows[0];
  const publishable = can(admin.role, "content.publish");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Website Settings"
        description="Business identity, contact channels, social links and customer testimonials. Saved as drafts until published."
        actions={<ButtonLink href="/admin/versions?scope=settings" variant="ghost">Version history</ButtonLink>}
      />

      <DraftBar
        scope="settings"
        returnTo="/admin/settings"
        hasDraft={hasDraft}
        publishedAt={lastPublished?.publishedAt ? new Date(lastPublished.publishedAt).toLocaleString("en-IN") : null}
        publishedBy={lastPublished?.publishedBy ?? null}
        canPublish={publishable}
        publishAction={publishContent}
        discardAction={discardDraft}
        previewAction={setPreviewMode}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Business identity" description="Legal details and site availability" actions={<Tag tone="blue"><Building2 className="size-2.5" /> Site-wide</Tag>} padded>
          <form action={saveBusinessSettings} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Business name" name="businessName" defaultValue={settings.business.businessName} required />
              <Field label="Legal / registered name" name="legalName" defaultValue={settings.business.legalName} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="GSTIN" name="gstin" defaultValue={settings.business.gstin} placeholder="27XXXXXXXXXXXZX" />
              <Field label="Copyright line" name="copyright" defaultValue={settings.business.copyright} />
            </div>
            <Field label="Contact page heading" name="contactHeading" defaultValue={settings.business.contactHeading} />
            <TextArea label="Contact page intro" name="contactIntro" defaultValue={settings.business.contactIntro} rows={2} />

            <div className="grid gap-2 sm:grid-cols-2">
              <Toggle label="Website visible" name="siteVisible" defaultChecked={settings.business.siteVisible} hint="Uncheck to hide the public site entirely." />
              <Toggle label="Maintenance mode" name="maintenanceMode" defaultChecked={settings.business.maintenanceMode} hint="Shows a holding page to visitors." />
            </div>
            <TextArea label="Maintenance message" name="maintenanceMessage" defaultValue={settings.business.maintenanceMessage} rows={2} />
            <AdminSubmit><Save className="size-3.5" /> Save business settings</AdminSubmit>
          </form>
        </Panel>

        <Panel title="Contact & social" description="Shown in the header, footer and contact page" actions={<Tag tone="gold"><Globe className="size-2.5" /> Public</Tag>} padded>
          <form action={saveContactSettings} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone (display)" name="phone" defaultValue={settings.contact.phone} />
              <Field label="Phone (dial link)" name="phoneHref" defaultValue={settings.contact.phoneHref} hint="Include country code, e.g. +9198…" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="WhatsApp number" name="whatsapp" defaultValue={settings.contact.whatsapp} hint="Digits only, with country code." />
              <Field label="Email" name="email" type="email" defaultValue={settings.contact.email} />
            </div>
            <TextArea label="Address" name="address" defaultValue={settings.contact.address} rows={2} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Google Maps query" name="mapQuery" defaultValue={settings.contact.mapQuery} />
              <Field label="Business hours" name="hours" defaultValue={settings.contact.hours} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Instagram URL" name="instagram" defaultValue={settings.contact.instagram} />
              <Field label="LinkedIn URL" name="linkedin" defaultValue={settings.contact.linkedin} />
              <Field label="Facebook URL" name="facebook" defaultValue={settings.contact.facebook} />
              <Field label="YouTube URL" name="youtube" defaultValue={settings.contact.youtube} />
            </div>
            <AdminSubmit><Save className="size-3.5" /> Save contact details</AdminSubmit>
          </form>
        </Panel>
      </div>

      <Panel
        title="Customer testimonials"
        description="Published quotes appear on the website. Draft entries stay hidden."
        actions={<Tag tone="neutral"><MessageSquareQuote className="size-2.5" /> {quotes.length} total</Tag>}
      >
        <div className="border-b border-black/6 bg-black/[0.015] p-4">
          <form action={saveTestimonial} className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
            <Field label="Customer name" name="customerName" placeholder="e.g. Priya Sharma" required />
            <Field label="Company" name="company" placeholder="e.g. Acme Corp" />
            <Field label="Quote" name="quote" placeholder="What they said about the gifting experience…" required />
            <div className="flex items-center gap-2">
              <select name="rating" defaultValue="5" className="rounded-lg border border-black/10 bg-white px-2 py-2 text-[0.72rem] outline-none">
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value}★</option>
                ))}
              </select>
              <input type="hidden" name="isPublished" value="on" />
              <AdminSubmit size="sm">Add</AdminSubmit>
            </div>
          </form>
        </div>

        {quotes.length === 0 ? (
          <EmptyState title="No testimonials yet" description="Add your first customer quote above." icon={MessageSquareQuote} />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>Quote</Th>
                  <Th>Rating</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className="align-top hover:bg-black/[0.015]">
                    <Td>
                      <p className="text-[0.74rem] font-medium text-[#14161a]">{quote.customerName}</p>
                      <p className="text-[0.62rem] text-[#8b919d]">{quote.company || "—"}</p>
                    </Td>
                    <Td>
                      <p className="max-w-[360px] text-[0.72rem] leading-relaxed text-[#3f4552]">“{quote.quote}”</p>
                      <details className="mt-1.5">
                        <summary className="cursor-pointer text-[0.62rem] font-medium text-[#0d1f3c]">Edit</summary>
                        <form action={saveTestimonial} className="mt-2 space-y-2 rounded-lg border border-black/8 bg-black/[0.015] p-2.5">
                          <input type="hidden" name="id" value={quote.id} />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Field label="Name" name="customerName" defaultValue={quote.customerName} required />
                            <Field label="Company" name="company" defaultValue={quote.company ?? ""} />
                          </div>
                          <TextArea label="Quote" name="quote" defaultValue={quote.quote} rows={2} />
                          <div className="flex flex-wrap items-end gap-2">
                            <select name="rating" defaultValue={String(quote.rating)} className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[0.7rem]">
                              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}★</option>)}
                            </select>
                            <Field label="Sort" name="sortOrder" type="number" defaultValue={quote.sortOrder} className="w-20" />
                            <label className="flex items-center gap-1.5 text-[0.68rem] text-[#3f4552]">
                              <input type="checkbox" name="isPublished" defaultChecked={quote.isPublished} className="size-3.5 accent-[#0d1f3c]" /> Published
                            </label>
                            <AdminSubmit size="sm">Save</AdminSubmit>
                          </div>
                        </form>
                      </details>
                    </Td>
                    <Td className="text-[0.72rem] text-[#8a6a33]">{"★".repeat(quote.rating)}</Td>
                    <Td>{quote.isPublished ? <Tag tone="green">Published</Tag> : <Tag tone="neutral">Draft</Tag>}</Td>
                    <Td>
                      <div className="flex justify-end">
                        <ConfirmAction
                          action={deleteTestimonial}
                          fields={{ id: quote.id }}
                          message={`Delete the testimonial from ${quote.customerName}? This cannot be undone.`}
                          confirmLabel="Delete"
                          className="rounded-md px-2 py-1 text-[0.64rem] font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </ConfirmAction>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>

      <Panel title="Danger zone" description="Operational safeguards">
        <div className="flex items-start gap-3 p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
            <ShieldAlert className="size-4" />
          </span>
          <p className="text-[0.72rem] leading-relaxed text-[#6b7280]">
            Maintenance mode and site visibility changes are saved as drafts and only take effect after publishing.
            Publishing is restricted to roles with the publish capability, and every publish is recorded in the audit log.
          </p>
        </div>
      </Panel>
    </div>
  );
}
