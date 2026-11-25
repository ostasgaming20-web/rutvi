import { asc } from "drizzle-orm";
import { GripVertical, Layers, Plus, Save, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { homepageSections } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { latestVersion, SECTION_TYPE_LABELS } from "@/lib/content";
import {
  updateHomepageSection,
  reorderHomepageSections,
  toggleHomepageSection,
  addHomepageSection,
  deleteHomepageSection,
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
import { MediaField } from "@/components/admin/media-field";
import { SortableList } from "@/components/admin/sortable-list";
import { ConfirmAction } from "@/components/admin/confirm-action";

export const dynamic = "force-dynamic";

const SECTION_TYPES = ["hero", "highlights", "marquee", "categories", "featured", "customization", "hampers", "why-choose", "process", "testimonials", "enquiry", "custom"];

export default async function AdminHomepagePage() {
  const admin = await requireCapability("content.edit");
  const [sections, version] = await Promise.all([
    db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder)),
    latestVersion("homepage"),
  ]);

  const latestUpdate = sections.reduce((max, section) => Math.max(max, section.updatedAt?.getTime() ?? 0), 0);
  const hasDraft = !version || latestUpdate > version.createdAt.getTime();
  const publishable = can(admin.role, "content.publish");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Website studio"
        title="Homepage Management"
        description="Control which sections appear on the homepage, their order and their content. Publish to push the layout live."
        actions={
          <>
            <ButtonLink href="/admin/editor" variant="ghost">Live editor</ButtonLink>
            <ButtonLink href="/admin/versions?scope=homepage" variant="ghost">History</ButtonLink>
          </>
        }
      />

      <DraftBar
        scope="homepage"
        returnTo="/admin/homepage"
        hasDraft={hasDraft}
        publishedAt={version ? new Date(version.createdAt).toLocaleString("en-IN") : null}
        publishedBy={version?.authorEmail ?? null}
        canPublish={publishable}
        publishAction={publishContent}
        discardAction={discardDraft}
        previewAction={setPreviewMode}
      />

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Panel title="Section order" description="Drag to reorder, toggle visibility" actions={<Tag tone="blue"><Layers className="size-2.5" /> {sections.length}</Tag>}>
            <SortableList
              items={sections.map((section) => ({
                id: section.id,
                label: section.title || SECTION_TYPE_LABELS[section.type] || section.type,
                meta: SECTION_TYPE_LABELS[section.type] ?? section.type,
                enabled: section.isEnabled,
              }))}
              reorderAction={reorderHomepageSections}
              toggleAction={toggleHomepageSection}
              toggleField="isEnabled"
              emptyLabel="No homepage sections yet."
            />
          </Panel>

          <Panel title="Add a section" padded>
            <form action={addHomepageSection} className="space-y-3">
              <Field label="Section title" name="title" placeholder="e.g. Festive gifting" required />
              <label className="block">
                <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Section type</span>
                <select name="type" defaultValue="custom" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                  {SECTION_TYPES.map((type) => (
                    <option key={type} value={type}>{SECTION_TYPE_LABELS[type] ?? type}</option>
                  ))}
                </select>
              </label>
              <AdminSubmit className="w-full"><Plus className="size-3.5" /> Add section</AdminSubmit>
            </form>
          </Panel>
        </div>

        <div className="space-y-3">
          {sections.length === 0 ? (
            <Panel><p className="p-6 text-center text-[0.75rem] text-[#8b919d]">Add your first homepage section.</p></Panel>
          ) : (
            sections.map((section) => (
              <Panel
                key={section.id}
                title={section.title || SECTION_TYPE_LABELS[section.type] || section.type}
                description={`${SECTION_TYPE_LABELS[section.type] ?? section.type} · position ${section.sortOrder + 1}`}
                actions={
                  <div className="flex items-center gap-1.5">
                    <Tag tone={section.isEnabled ? "green" : "neutral"}>{section.isEnabled ? "Visible" : "Hidden"}</Tag>
                    <ConfirmAction
                      action={deleteHomepageSection}
                      fields={{ id: section.id }}
                      message="Delete this section? This cannot be undone."
                      confirmLabel="Delete section"
                      className="grid size-7 place-items-center rounded-md text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                    </ConfirmAction>
                  </div>
                }
              >
                <details className="group">
                  <summary className="flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-[0.68rem] font-semibold text-[#0d1f3c] hover:bg-black/[0.015]">
                    <GripVertical className="size-3.5 text-[#8b919d]" /> Edit content
                  </summary>
                  <form action={updateHomepageSection} className="space-y-3 border-t border-black/6 p-4">
                    <input type="hidden" name="id" value={section.id} />
                    <input type="hidden" name="returnTo" value="/admin/homepage" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Title" name="title" defaultValue={section.title ?? ""} />
                      <Field label="Eyebrow" name="eyebrow" defaultValue={section.eyebrow ?? ""} />
                      <Field label="Subtitle" name="subtitle" defaultValue={section.subtitle ?? ""} />
                    </div>
                    <TextArea label="Body copy" name="body" defaultValue={section.body ?? ""} rows={3} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Primary CTA label" name="ctaLabel" defaultValue={section.ctaLabel ?? ""} />
                      <Field label="Primary CTA link" name="ctaHref" defaultValue={section.ctaHref ?? ""} />
                      <Field label="Secondary CTA label" name="secondaryCtaLabel" defaultValue={section.secondaryCtaLabel ?? ""} />
                      <Field label="Secondary CTA link" name="secondaryCtaHref" defaultValue={section.secondaryCtaHref ?? ""} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
                      <MediaField name="imageUrl" label="Section image" defaultValue={section.imageUrl ?? ""} folder="homepage" />
                      <Toggle label="Section enabled" name="isEnabled" defaultChecked={section.isEnabled} />
                    </div>
                    <AdminSubmit size="sm"><Save className="size-3.5" /> Save section</AdminSubmit>
                  </form>
                </details>
              </Panel>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
