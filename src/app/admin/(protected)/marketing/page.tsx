import { asc } from "drizzle-orm";
import { CalendarClock, Megaphone, Plus, Save, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { promoCampaigns } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { latestVersion } from "@/lib/content";
import {
  saveCampaign,
  deleteCampaign,
  toggleCampaign,
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
  EmptyState,
} from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { DraftBar } from "@/components/admin/draft-bar";
import { MediaField } from "@/components/admin/media-field";
import { ConfirmAction } from "@/components/admin/confirm-action";

export const dynamic = "force-dynamic";

const TYPES = [
  { value: "announcement", label: "Announcement bar" },
  { value: "banner", label: "Promotional banner" },
  { value: "popup", label: "Popup" },
];

const PLACEMENTS = [
  { value: "site_top", label: "Site top / announcement" },
  { value: "hero", label: "Homepage hero" },
  { value: "products", label: "Products listing" },
  { value: "footer", label: "Footer" },
];

function toInputValue(value: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function statusOf(campaign: { isActive: boolean; startsAt: Date | null; endsAt: Date | null }) {
  if (!campaign.isActive) return { label: "Paused", tone: "neutral" as const };
  const now = Date.now();
  if (campaign.startsAt && campaign.startsAt.getTime() > now) return { label: "Scheduled", tone: "blue" as const };
  if (campaign.endsAt && campaign.endsAt.getTime() < now) return { label: "Expired", tone: "red" as const };
  return { label: "Live", tone: "green" as const };
}

export default async function AdminMarketingPage() {
  const admin = await requireCapability("marketing.manage");
  const [campaigns, version] = await Promise.all([
    db.select().from(promoCampaigns).orderBy(asc(promoCampaigns.sortOrder), asc(promoCampaigns.id)),
    latestVersion("marketing"),
  ]);

  const snapshotCount = ((version?.snapshot as { items?: unknown[] })?.items ?? []).length;
  const hasDraft = !version || snapshotCount !== campaigns.length;
  const publishable = can(admin.role, "content.publish");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Website studio"
        title="Marketing & Promotions"
        description="Schedule announcements, banners and popups. Campaigns respect their start and end windows on the live site."
        actions={<ButtonLink href="/admin/versions?scope=marketing" variant="ghost">History</ButtonLink>}
      />

      <DraftBar
        scope="marketing"
        returnTo="/admin/marketing"
        hasDraft={hasDraft}
        publishedAt={version ? new Date(version.createdAt).toLocaleString("en-IN") : null}
        publishedBy={version?.authorEmail ?? null}
        canPublish={publishable}
        publishAction={publishContent}
        discardAction={discardDraft}
        previewAction={setPreviewMode}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <Panel>
              <EmptyState
                title="No campaigns yet"
                description="Create an announcement or promotional banner to highlight festive gifting, new collections or offers."
                icon={Megaphone}
              />
            </Panel>
          ) : (
            campaigns.map((campaign) => {
              const status = statusOf(campaign);
              return (
                <Panel
                  key={campaign.id}
                  title={campaign.name}
                  description={`${TYPES.find((type) => type.value === campaign.type)?.label ?? campaign.type} · ${PLACEMENTS.find((place) => place.value === campaign.placement)?.label ?? campaign.placement}`}
                  actions={
                    <div className="flex items-center gap-1.5">
                      <Tag tone={status.tone}>{status.label}</Tag>
                      <form action={toggleCampaign}>
                        <input type="hidden" name="id" value={campaign.id} />
                        <button type="submit" className="rounded-md px-2 py-1 text-[0.62rem] font-semibold text-[#0d1f3c] hover:bg-[#0d1f3c]/5">
                          {campaign.isActive ? "Pause" : "Activate"}
                        </button>
                      </form>
                      <ConfirmAction
                        action={deleteCampaign}
                        fields={{ id: campaign.id }}
                        message={`Delete campaign “${campaign.name}”?`}
                        confirmLabel="Delete"
                        className="grid size-7 place-items-center rounded-md text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                      </ConfirmAction>
                    </div>
                  }
                >
                  <details>
                    <summary className="cursor-pointer px-4 py-2.5 text-[0.68rem] font-semibold text-[#0d1f3c] hover:bg-black/[0.015]">Edit campaign</summary>
                    <form action={saveCampaign} className="space-y-3 border-t border-black/6 p-4">
                      <input type="hidden" name="id" value={campaign.id} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Campaign name" name="name" defaultValue={campaign.name} required />
                        <Field label="Sort order" name="sortOrder" type="number" defaultValue={campaign.sortOrder} />
                        <label className="block">
                          <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Type</span>
                          <select name="type" defaultValue={campaign.type} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                            {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Placement</span>
                          <select name="placement" defaultValue={campaign.placement} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                            {PLACEMENTS.map((place) => <option key={place.value} value={place.value}>{place.label}</option>)}
                          </select>
                        </label>
                      </div>
                      <Field label="Headline" name="headline" defaultValue={campaign.headline ?? ""} />
                      <TextArea label="Body" name="body" defaultValue={campaign.body ?? ""} rows={2} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="CTA label" name="ctaLabel" defaultValue={campaign.ctaLabel ?? ""} />
                        <Field label="CTA link" name="ctaHref" defaultValue={campaign.ctaHref ?? ""} />
                        <Field label="Starts at" name="startsAt" type="datetime-local" defaultValue={toInputValue(campaign.startsAt)} />
                        <Field label="Ends at" name="endsAt" type="datetime-local" defaultValue={toInputValue(campaign.endsAt)} />
                      </div>
                      <MediaField name="imageUrl" label="Banner image" defaultValue={campaign.imageUrl ?? ""} folder="marketing" />
                      <Toggle label="Active" name="isActive" defaultChecked={campaign.isActive} />
                      <AdminSubmit size="sm"><Save className="size-3.5" /> Save campaign</AdminSubmit>
                    </form>
                  </details>
                </Panel>
              );
            })
          )}
        </div>

        <Panel title="New campaign" description="Announcements and offers" padded>
          <form action={saveCampaign} className="space-y-3">
            <Field label="Campaign name" name="name" placeholder="Diwali gifting 2026" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Type</span>
                <select name="type" defaultValue="announcement" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                  {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Placement</span>
                <select name="placement" defaultValue="site_top" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                  {PLACEMENTS.map((place) => <option key={place.value} value={place.value}>{place.label}</option>)}
                </select>
              </label>
            </div>
            <Field label="Headline" name="headline" placeholder="Festive gifting, sorted." />
            <TextArea label="Body" name="body" rows={2} placeholder="Order by 20 October for Diwali delivery." />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CTA label" name="ctaLabel" placeholder="Shop festive" />
              <Field label="CTA link" name="ctaHref" placeholder="/products" />
              <Field label="Starts at" name="startsAt" type="datetime-local" />
              <Field label="Ends at" name="endsAt" type="datetime-local" />
            </div>
            <MediaField name="imageUrl" label="Banner image" folder="marketing" />
            <Toggle label="Active" name="isActive" defaultChecked />
            <AdminSubmit className="w-full"><Plus className="size-3.5" /> Create campaign</AdminSubmit>
            <p className="flex items-center gap-1 text-[0.6rem] text-[#8b919d]">
              <CalendarClock className="size-3" /> Leave dates blank to run indefinitely.
            </p>
          </form>
        </Panel>
      </div>
    </div>
  );
}
