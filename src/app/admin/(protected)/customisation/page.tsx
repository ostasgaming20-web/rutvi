import { eq, isNotNull, desc } from "drizzle-orm";
import { Palette, Save, Sparkles, Type } from "lucide-react";
import { db } from "@/lib/db";
import { websiteSettings } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { getDraftSettings } from "@/lib/settings";
import {
  saveBranding,
  saveFooterSettings,
  saveHeroSettings,
  saveStatsSettings,
  publishContent,
  discardDraft,
  setPreviewMode,
} from "@/app/admin/content-actions";
import { PageHeader, Panel, Field, TextArea, Select, ButtonLink, Tag } from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { MediaField } from "@/components/admin/media-field";
import { DraftBar } from "@/components/admin/draft-bar";
import { PreviewFrame } from "@/components/admin/preview-frame";

export const dynamic = "force-dynamic";

const FONT_OPTIONS = [
  { value: "Cormorant Garamond", label: "Cormorant Garamond (serif)" },
  { value: "Playfair Display", label: "Playfair Display (serif)" },
  { value: "Manrope", label: "Manrope (sans)" },
  { value: "Inter", label: "Inter (sans)" },
  { value: "DM Sans", label: "DM Sans (sans)" },
];

export default async function CustomisationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireCapability("content.edit");
  await searchParams;

  const [settings, drafts, publishedRows] = await Promise.all([
    getDraftSettings(),
    db
      .select({ key: websiteSettings.key })
      .from(websiteSettings)
      .where(isNotNull(websiteSettings.draftValue)),
    db
      .select({ key: websiteSettings.key, publishedAt: websiteSettings.publishedAt, publishedBy: websiteSettings.publishedBy })
      .from(websiteSettings)
      .orderBy(desc(websiteSettings.publishedAt))
      .limit(1),
  ]);

  const draftKeys = new Set(drafts.map((row) => row.key));
  const hasDraft = ["branding", "hero", "footer", "stats", "contact", "business", "seo"].some((key) => draftKeys.has(key));
  const lastPublished = publishedRows[0];
  const publishable = can(admin.role, "content.publish");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Website studio"
        title="Website Customisation"
        description="Change the look, copy and feel of the live website without touching code. Edits are saved as a draft until you publish."
        actions={
          <ButtonLink href="/admin/versions?scope=settings" variant="ghost">
            Version history
          </ButtonLink>
        }
      />

      <DraftBar
        scope="settings"
        returnTo="/admin/customisation"
        hasDraft={hasDraft}
        publishedAt={lastPublished?.publishedAt ? new Date(lastPublished.publishedAt).toLocaleString("en-IN") : null}
        publishedBy={lastPublished?.publishedBy ?? null}
        canPublish={publishable}
        publishAction={publishContent}
        discardAction={discardDraft}
        previewAction={setPreviewMode}
      />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Panel
            title="Branding"
            description="Logo, colours, typography and button styling"
            actions={<Tag tone="blue"><Palette className="size-2.5" /> Applies site-wide</Tag>}
            padded
          >
            <form action={saveBranding} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <MediaField name="logoUrl" label="Business logo" defaultValue={settings.branding.logoUrl} folder="brand" preview="wide" />
                <MediaField name="faviconUrl" label="Favicon" defaultValue={settings.branding.faviconUrl} folder="brand" preview="square" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Website name" name="siteName" defaultValue={settings.branding.siteName} required />
                <Field label="Tagline" name="tagline" defaultValue={settings.branding.tagline} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ColorField label="Primary brand colour" name="primaryColor" defaultValue={settings.branding.primaryColor} />
                <ColorField label="Accent (champagne gold)" name="accentColor" defaultValue={settings.branding.accentColor} />
                <ColorField label="Background colour" name="backgroundColor" defaultValue={settings.branding.backgroundColor} />
                <ColorField label="Surface / card colour" name="surfaceColor" defaultValue={settings.branding.surfaceColor} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Select
                  label="Button style"
                  name="buttonStyle"
                  defaultValue={settings.branding.buttonStyle}
                  options={[
                    { value: "rounded", label: "Rounded" },
                    { value: "pill", label: "Pill" },
                    { value: "square", label: "Square" },
                  ]}
                />
                <Select label="Heading font" name="headingFont" defaultValue={settings.branding.headingFont} options={FONT_OPTIONS} />
                <Select label="Body font" name="bodyFont" defaultValue={settings.branding.bodyFont} options={FONT_OPTIONS} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Border radius (e.g. 0.75rem)" name="radius" defaultValue={settings.branding.radius} hint="Controls card and input corners." />
                <div className="grid gap-3">
                  <Field label="Announcement bar text" name="announcement" defaultValue={settings.branding.announcement} hint="Leave blank to hide the announcement bar." />
                  <Field label="Announcement link" name="announcementHref" defaultValue={settings.branding.announcementHref} placeholder="/hampers" />
                </div>
              </div>

              <div className="flex justify-end border-t border-black/6 pt-3">
                <AdminSubmit>
                  <Save className="size-3.5" /> Save branding draft
                </AdminSubmit>
              </div>
            </form>
          </Panel>

          <Panel title="Hero section" description="The first thing visitors read" padded>
            <form action={saveHeroSettings} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Eyebrow" name="eyebrow" defaultValue={settings.hero.eyebrow} />
                <Field label="Badge" name="badge" defaultValue={settings.hero.badge} />
              </div>
              <Field label="Headline" name="headline" defaultValue={settings.hero.headline} required />
              <TextArea label="Description" name="description" defaultValue={settings.hero.description} rows={3} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Primary CTA label" name="primaryCta" defaultValue={settings.hero.primaryCta} />
                <Field label="Secondary CTA label" name="secondaryCta" defaultValue={settings.hero.secondaryCta} />
              </div>
              <div className="flex justify-end border-t border-black/6 pt-3">
                <AdminSubmit>
                  <Save className="size-3.5" /> Save hero draft
                </AdminSubmit>
              </div>
            </form>
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Footer" padded>
              <form action={saveFooterSettings} className="space-y-3">
                <TextArea label="Footer tagline" name="tagline" defaultValue={settings.footer.tagline} rows={3} />
                <TextArea label="Footer note" name="note" defaultValue={settings.footer.note} rows={2} />
                <div className="flex justify-end">
                  <AdminSubmit size="sm">
                    <Save className="size-3" /> Save
                  </AdminSubmit>
                </div>
              </form>
            </Panel>

            <Panel title="Stat highlights" description="Shown in the why-choose block" padded>
              <form action={saveStatsSettings} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Products" name="products" defaultValue={settings.stats.products} />
                  <Field label="Categories" name="categories" defaultValue={settings.stats.categories} />
                  <Field label="Hampers" name="hampers" defaultValue={settings.stats.hampers} />
                  <Field label="Delivery" name="delivery" defaultValue={settings.stats.delivery} />
                </div>
                <div className="flex justify-end">
                  <AdminSubmit size="sm">
                    <Save className="size-3" /> Save
                  </AdminSubmit>
                </div>
              </form>
            </Panel>
          </div>

          <Panel title="Typography & layout notes" padded>
            <div className="flex items-start gap-2 rounded-lg bg-[#0d1f3c]/[0.03] p-3">
              <Type className="mt-0.5 size-4 shrink-0 text-[#0d1f3c]" />
              <p className="text-[0.72rem] leading-relaxed text-[#5c6270]">
                Typography and colour tokens are applied through CSS variables on the live site, so your changes flow to
                every page — header, footer, product cards, buttons and forms. Section spacing, alignment and animation
                controls live in the{" "}
                <a href="/admin/editor" className="font-semibold text-[#0d1f3c] hover:underline">
                  Live Website Editor
                </a>
                .
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Live preview" description="Drafts render here before publishing" padded>
            <PreviewFrame path="/" height={640} />
          </Panel>
          <Panel title="Publishing checklist">
            <ul className="space-y-2 p-4 text-[0.72rem] text-[#5c6270]">
              {[
                "Save each block you change — the bar at the top shows unpublished work.",
                "Use Preview to see drafts on the real website in a new tab.",
                "Publish to make changes live; a version snapshot is created automatically.",
                "Roll back any time from Version history.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-[#c3a068]" />
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-2 py-1.5">
        <input
          type="color"
          name={name}
          defaultValue={defaultValue || "#000000"}
          className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={label}
        />
        <span className="text-[0.7rem] text-[#6b7280]">{defaultValue}</span>
      </div>
    </label>
  );
}
