import { asc } from "drizzle-orm";
import { Globe, Save, Search, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { seoMetadata, websiteSettings } from "@/lib/db/schema";
import { isNotNull } from "drizzle-orm";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { getDraftSettings } from "@/lib/settings";
import { latestVersion } from "@/lib/content";
import {
  saveSeoEntry,
  deleteSeoEntry,
  saveSeoSettings,
  publishContent,
  discardDraft,
  setPreviewMode,
} from "@/app/admin/content-actions";
import {
  PageHeader,
  Panel,
  Field,
  TextArea,
  Toggle,
  Tag,
  ButtonLink,
  Meter,
} from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { DraftBar } from "@/components/admin/draft-bar";
import { MediaField } from "@/components/admin/media-field";
import { ConfirmAction } from "@/components/admin/confirm-action";

export const dynamic = "force-dynamic";

function completeness(entry: { title: string | null; description: string | null; ogImage: string | null; keywords: string | null; canonical: string | null }) {
  const fields = [entry.title, entry.description, entry.ogImage, entry.keywords, entry.canonical];
  return Math.round((fields.filter((value) => value && String(value).trim().length > 0).length / fields.length) * 100);
}

export default async function AdminSeoPage() {
  const admin = await requireCapability("seo.manage");
  const [entries, settings, version, draftRows] = await Promise.all([
    db.select().from(seoMetadata).orderBy(asc(seoMetadata.path)),
    getDraftSettings(),
    latestVersion("seo"),
    db.select({ key: websiteSettings.key }).from(websiteSettings).where(isNotNull(websiteSettings.draftValue)),
  ]);

  const snapshotCount = ((version?.snapshot as { items?: unknown[] })?.items ?? []).length;
  const hasDraft = !version || snapshotCount !== entries.length;
  const settingsDraft = draftRows.some((row) => row.key === "seo");
  const publishable = can(admin.role, "content.publish");
  const average = entries.length ? Math.round(entries.reduce((sum, entry) => sum + completeness(entry), 0) / entries.length) : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Website studio"
        title="SEO Management"
        description="Per-page metadata, Open Graph images and indexing controls. Complete metadata improves search visibility."
        actions={<ButtonLink href="/admin/versions?scope=seo" variant="ghost">History</ButtonLink>}
      />

      <DraftBar
        scope="seo"
        returnTo="/admin/seo"
        hasDraft={hasDraft}
        publishedAt={version ? new Date(version.createdAt).toLocaleString("en-IN") : null}
        publishedBy={version?.authorEmail ?? null}
        canPublish={publishable}
        publishAction={publishContent}
        discardAction={discardDraft}
        previewAction={setPreviewMode}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8b919d]">Pages configured</p>
          <p className="mt-1 text-[1.4rem] font-semibold text-[#14161a]">{entries.length}</p>
        </div>
        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8b919d]">Average completeness</p>
          <p className="mt-1 text-[1.4rem] font-semibold text-[#14161a]">{average}%</p>
          <div className="mt-1.5"><Meter value={average} tone="gold" /></div>
        </div>
        <div className="rounded-xl border border-black/7 bg-white p-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8b919d]">Indexing</p>
          <p className="mt-1 text-[0.9rem] font-semibold text-[#14161a]">{settings.seo.indexSite ? "Indexable" : "No-index"}</p>
          <p className="text-[0.62rem] text-[#8b919d]">{settings.seo.sitemapEnabled ? "Sitemap enabled" : "Sitemap disabled"}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          <Panel title="Page metadata" description="Edit each path independently">
            <div className="divide-y divide-black/5">
              {entries.map((entry) => (
                <details key={entry.id} className="group">
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-black/[0.015]">
                    <span className="min-w-0">
                      <span className="font-mono text-[0.72rem] font-medium text-[#14161a]">{entry.path}</span>
                      <span className="ml-2 text-[0.62rem] text-[#8b919d]">{entry.title || "No title set"}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-20"><Meter value={completeness(entry)} tone={completeness(entry) > 70 ? "green" : completeness(entry) > 40 ? "gold" : "blue"} /></span>
                      <Tag tone={entry.robots.includes("noindex") ? "red" : "green"}>{entry.robots.includes("noindex") ? "No-index" : "Index"}</Tag>
                    </span>
                  </summary>
                  <form action={saveSeoEntry} className="space-y-3 border-t border-black/6 bg-black/[0.01] p-4">
                    <input type="hidden" name="id" value={entry.id} />
                    <Field label="Path" name="path" defaultValue={entry.path} required />
                    <Field label="Meta title" name="title" defaultValue={entry.title ?? ""} hint={`${(entry.title ?? "").length}/60 characters`} />
                    <TextArea label="Meta description" name="description" defaultValue={entry.description ?? ""} rows={2} hint={`${(entry.description ?? "").length}/160 characters`} />
                    <Field label="Keywords" name="keywords" defaultValue={entry.keywords ?? ""} hint="Comma separated" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Canonical URL" name="canonical" defaultValue={entry.canonical ?? ""} />
                      <label className="block">
                        <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Robots</span>
                        <select name="robots" defaultValue={entry.robots} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                          <option value="index,follow">index, follow</option>
                          <option value="noindex,follow">noindex, follow</option>
                          <option value="index,nofollow">index, nofollow</option>
                          <option value="noindex,nofollow">noindex, nofollow</option>
                        </select>
                      </label>
                    </div>
                    <MediaField name="ogImage" label="Open Graph image" defaultValue={entry.ogImage ?? ""} folder="seo" />
                    <Field label="Image alt text" name="altText" defaultValue={entry.altText ?? ""} />
                    <div className="flex items-center gap-2">
                      <AdminSubmit size="sm"><Save className="size-3.5" /> Save metadata</AdminSubmit>
                      <ConfirmAction
                        action={deleteSeoEntry}
                        fields={{ id: entry.id }}
                        message={`Delete SEO metadata for ${entry.path}?`}
                        confirmLabel="Delete"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[0.65rem] font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-3" /> Delete
                      </ConfirmAction>
                    </div>
                  </form>
                </details>
              ))}
              {entries.length === 0 && <p className="px-4 py-8 text-center text-[0.72rem] text-[#8b919d]">No SEO entries yet.</p>}
            </div>
          </Panel>

          <Panel title="Add / override a path" description="Upserts by path" padded>
            <form action={saveSeoEntry} className="grid gap-3 sm:grid-cols-2">
              <Field label="Path" name="path" placeholder="/festive-gifting" required />
              <Field label="Meta title" name="title" placeholder="Festive corporate gifting" />
              <TextArea label="Meta description" name="description" rows={2} className="sm:col-span-2" />
              <Field label="Keywords" name="keywords" />
              <MediaField name="ogImage" label="Open Graph image" folder="seo" />
              <div className="sm:col-span-2">
                <AdminSubmit size="sm"><Search className="size-3.5" /> Save entry</AdminSubmit>
              </div>
            </form>
          </Panel>
        </div>

        <Panel
          title="Global SEO defaults"
          description="Title template, social card and robots"
          actions={<Tag tone={settingsDraft ? "amber" : "green"}>{settingsDraft ? "Unpublished" : "Saved"}</Tag>}
          padded
        >
          <form action={saveSeoSettings} className="space-y-3">
            <Field label="Title template" name="titleTemplate" defaultValue={settings.seo.titleTemplate} hint="Use %s for the page title" />
            <Field label="Twitter / X handle" name="twitterHandle" defaultValue={settings.seo.twitterHandle} placeholder="@rutvi" />
            <MediaField name="defaultOgImage" label="Default social image" defaultValue={settings.seo.defaultOgImage} folder="seo" />
            <Toggle label="Allow search indexing" name="indexSite" defaultChecked={settings.seo.indexSite} hint="Adds noindex to the whole site when off." />
            <Toggle label="Generate sitemap.xml" name="sitemapEnabled" defaultChecked={settings.seo.sitemapEnabled} />
            <TextArea label="robots.txt override" name="robotsTxt" defaultValue={settings.seo.robotsTxt} rows={4} placeholder="Leave blank to use the generated default." />
            <div className="flex flex-wrap items-center gap-2">
              <AdminSubmit size="sm"><Save className="size-3.5" /> Save defaults</AdminSubmit>
            </div>
          </form>
          {settingsDraft && publishable ? (
            <form action={publishContent} className="mt-2 border-t border-black/6 pt-2">
              <input type="hidden" name="scope" value="settings" />
              <input type="hidden" name="returnTo" value="/admin/seo" />
              <AdminSubmit size="sm" variant="gold"><Globe className="size-3" /> Publish global settings</AdminSubmit>
            </form>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
