import Link from "next/link";
import { asc } from "drizzle-orm";
import { ExternalLink, Layers, MousePointerClick, Save } from "lucide-react";
import { db } from "@/lib/db";
import { homepageSections } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { getDraftSettings, getPublishedSettings } from "@/lib/settings";
import { latestVersion, SECTION_TYPE_LABELS } from "@/lib/content";
import {
  updateHomepageSection,
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
} from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { DraftBar } from "@/components/admin/draft-bar";
import { PreviewFrame } from "@/components/admin/preview-frame";
import { MediaField } from "@/components/admin/media-field";

export const dynamic = "force-dynamic";

const PATHS = [
  { value: "/", label: "Home" },
  { value: "/products", label: "Products" },
  { value: "/hampers", label: "Hampers" },
  { value: "/about", label: "About" },
  { value: "/contact", label: "Contact" },
  { value: "/quote", label: "Request a quote" },
];

export default async function AdminEditorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireCapability("content.edit");
  const params = await searchParams;
  const selectedId = Number(params.section) || 0;
  const previewPath = typeof params.path === "string" && params.path.startsWith("/") ? params.path : "/";

  const [sections, version, draftSettings, publishedSettings] = await Promise.all([
    db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder)),
    latestVersion("homepage"),
    getDraftSettings(),
    getPublishedSettings(),
  ]);

  const selected = sections.find((section) => section.id === selectedId) ?? sections[0] ?? null;
  const latestUpdate = sections.reduce((max, section) => Math.max(max, section.updatedAt?.getTime() ?? 0), 0);
  const hasDraft = !version || latestUpdate > version.createdAt.getTime();
  const publishable = can(admin.role, "content.publish");
  const pendingSettings =
    JSON.stringify(draftSettings.branding) !== JSON.stringify(publishedSettings.branding) ||
    JSON.stringify(draftSettings.hero) !== JSON.stringify(publishedSettings.hero) ||
    JSON.stringify(draftSettings.footer) !== JSON.stringify(publishedSettings.footer);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Website studio"
        title="Live Website Editor"
        description="See the website and edit it side by side. Select a section on the left, tune it on the right, then publish when ready."
        actions={
          <>
            <ButtonLink href={previewPath} target="_blank" variant="ghost">
              <ExternalLink className="size-3.5" /> Open site
            </ButtonLink>
            <ButtonLink href="/admin/customisation" variant="ghost">Brand &amp; copy</ButtonLink>
          </>
        }
      />

      <DraftBar
        scope="homepage"
        returnTo="/admin/editor"
        hasDraft={hasDraft}
        publishedAt={version ? new Date(version.createdAt).toLocaleString("en-IN") : null}
        publishedBy={version?.authorEmail ?? null}
        canPublish={publishable}
        publishAction={publishContent}
        discardAction={discardDraft}
        previewAction={setPreviewMode}
      />

      {pendingSettings && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[0.7rem] text-amber-900">
          <span>You also have unpublished branding or copy changes waiting in Website Customisation.</span>
          <Link href="/admin/customisation" className="font-semibold underline-offset-2 hover:underline">Review &amp; publish →</Link>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[240px_1fr_360px]">
        <div className="space-y-3">
          <Panel title="Homepage sections" description="Click to edit">
            <ul className="divide-y divide-black/5">
              {sections.map((section) => {
                const active = selected?.id === section.id;
                return (
                  <li key={section.id}>
                    <Link
                      href={`/admin/editor?section=${section.id}${previewPath !== "/" ? `&path=${encodeURIComponent(previewPath)}` : ""}`}
                      className={`flex items-start justify-between gap-2 px-3 py-2.5 transition-colors ${
                        active ? "bg-[#0d1f3c]/5" : "hover:bg-black/[0.015]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className={`block truncate text-[0.72rem] font-medium ${active ? "text-[#0d1f3c]" : "text-[#14161a]"}`}>
                          {section.title || SECTION_TYPE_LABELS[section.type] || section.type}
                        </span>
                        <span className="text-[0.58rem] uppercase tracking-[0.08em] text-[#8b919d]">
                          {SECTION_TYPE_LABELS[section.type] ?? section.type}
                        </span>
                      </span>
                      <Tag tone={section.isEnabled ? "green" : "neutral"}>{section.isEnabled ? "On" : "Off"}</Tag>
                    </Link>
                  </li>
                );
              })}
              {sections.length === 0 && <li className="px-3 py-6 text-center text-[0.7rem] text-[#8b919d]">No sections yet.</li>}
            </ul>
            <div className="border-t border-black/6 p-2">
              <Link href="/admin/homepage" className="block rounded-md px-2 py-1.5 text-[0.66rem] font-medium text-[#0d1f3c] hover:bg-[#0d1f3c]/5">
                Manage all sections →
              </Link>
            </div>
          </Panel>

          <Panel title="Edit another page">
            <div className="space-y-1 p-2">
              {PATHS.map((path) => (
                <Link
                  key={path.value}
                  href={`/admin/editor?path=${encodeURIComponent(path.value)}${selected ? `&section=${selected.id}` : ""}`}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.68rem] ${
                    previewPath === path.value ? "bg-[#0d1f3c]/5 font-semibold text-[#0d1f3c]" : "text-[#3f4552] hover:bg-black/[0.02]"
                  }`}
                >
                  <MousePointerClick className="size-3" /> {path.label}
                </Link>
              ))}
              <Link href="/admin/seo" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.68rem] text-[#3f4552] hover:bg-black/[0.02]">
                <Layers className="size-3" /> Page SEO
              </Link>
            </div>
          </Panel>
        </div>

        <div className="min-w-0">
          <Panel title={`Preview · ${PATHS.find((item) => item.value === previewPath)?.label ?? previewPath}`} description="Live draft preview">
            <div className="p-3">
              <PreviewFrame path={previewPath} height={640} />
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <Panel title={selected ? "Edit section" : "No section selected"} description={selected ? SECTION_TYPE_LABELS[selected.type] ?? selected.type : undefined} padded>
            {selected ? (
              <form action={updateHomepageSection} className="space-y-3">
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="returnTo" value={`/admin/editor?section=${selected.id}`} />
                <Field label="Title" name="title" defaultValue={selected.title ?? ""} />
                <Field label="Eyebrow" name="eyebrow" defaultValue={selected.eyebrow ?? ""} />
                <Field label="Subtitle" name="subtitle" defaultValue={selected.subtitle ?? ""} />
                <TextArea label="Body copy" name="body" defaultValue={selected.body ?? ""} rows={4} />
                <MediaField name="imageUrl" label="Section image" defaultValue={selected.imageUrl ?? ""} folder="homepage" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Primary CTA label" name="ctaLabel" defaultValue={selected.ctaLabel ?? ""} />
                  <Field label="Primary CTA link" name="ctaHref" defaultValue={selected.ctaHref ?? ""} />
                  <Field label="Secondary CTA label" name="secondaryCtaLabel" defaultValue={selected.secondaryCtaLabel ?? ""} />
                  <Field label="Secondary CTA link" name="secondaryCtaHref" defaultValue={selected.secondaryCtaHref ?? ""} />
                </div>
                <Toggle label="Section enabled" name="isEnabled" defaultChecked={selected.isEnabled} />
                <AdminSubmit className="w-full"><Save className="size-3.5" /> Save section</AdminSubmit>
              </form>
            ) : (
              <p className="p-4 text-[0.72rem] text-[#8b919d]">Add a homepage section first.</p>
            )}
          </Panel>
          <Panel title="Key">
            <p className="p-3 text-[0.66rem] leading-relaxed text-[#8b919d]">
              Section edits save instantly to the draft. Use Publish to snapshot the homepage and make it live. You can roll
              back from Version History at any time.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
