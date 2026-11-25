import { asc } from "drizzle-orm";
import { Link2, Menu as MenuIcon, Plus, Save, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { navigationMenus } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { latestVersion } from "@/lib/content";
import {
  saveNavItem,
  deleteNavItem,
  reorderNavItems,
  toggleNavItem,
  publishContent,
  discardDraft,
  setPreviewMode,
} from "@/app/admin/content-actions";
import {
  PageHeader,
  Panel,
  Field,
  Toggle,
  Tag,
  ButtonLink,
} from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { DraftBar } from "@/components/admin/draft-bar";
import { SortableList } from "@/components/admin/sortable-list";
import { ConfirmAction } from "@/components/admin/confirm-action";

export const dynamic = "force-dynamic";

const LOCATIONS = [
  { value: "header", label: "Header navigation" },
  { value: "footer", label: "Footer links" },
  { value: "mobile", label: "Mobile menu" },
];

export default async function AdminNavigationPage() {
  const admin = await requireCapability("navigation.manage");
  const [items, version] = await Promise.all([
    db.select().from(navigationMenus).orderBy(asc(navigationMenus.location), asc(navigationMenus.sortOrder)),
    latestVersion("navigation"),
  ]);

  const snapshotCount = ((version?.snapshot as { items?: unknown[] })?.items ?? []).length;
  const hasDraft = !version || snapshotCount !== items.length;
  const publishable = can(admin.role, "content.publish");

  const byLocation = LOCATIONS.map((location) => ({
    ...location,
    items: items.filter((item) => item.location === location.value),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Website studio"
        title="Navigation & Menus"
        description="Structure the header, footer and mobile menus. Nested items appear as dropdowns where supported."
        actions={<ButtonLink href="/admin/versions?scope=navigation" variant="ghost">History</ButtonLink>}
      />

      <DraftBar
        scope="navigation"
        returnTo="/admin/navigation"
        hasDraft={hasDraft}
        publishedAt={version ? new Date(version.createdAt).toLocaleString("en-IN") : null}
        publishedBy={version?.authorEmail ?? null}
        canPublish={publishable}
        publishAction={publishContent}
        discardAction={discardDraft}
        previewAction={setPreviewMode}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {byLocation.map((group) => (
            <Panel
              key={group.value}
              title={group.label}
              description={`${group.items.length} item${group.items.length === 1 ? "" : "s"}`}
              actions={<Tag tone="blue"><MenuIcon className="size-2.5" /> {group.value}</Tag>}
            >
              <SortableList
                items={group.items.map((item) => ({
                  id: item.id,
                  label: item.label,
                  meta: item.href,
                  enabled: item.isActive,
                }))}
                reorderAction={reorderNavItems}
                toggleAction={toggleNavItem}
                toggleField="isActive"
                emptyLabel="No menu items in this location yet."
              />
              <div className="space-y-2 border-t border-black/6 p-3">
                {group.items.map((item) => (
                  <details key={item.id} className="rounded-lg border border-black/8">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[0.7rem]">
                      <span className="font-medium text-[#14161a]">
                        {item.label}
                        <span className="ml-2 text-[0.6rem] text-[#8b919d]">{item.href}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        {item.badge ? <Tag tone="gold">{item.badge}</Tag> : null}
                        <Tag tone={item.isActive ? "green" : "neutral"}>{item.isActive ? "On" : "Off"}</Tag>
                      </span>
                    </summary>
                    <form action={saveNavItem} className="grid gap-2 border-t border-black/6 p-3 sm:grid-cols-2">
                      <input type="hidden" name="id" value={item.id} />
                      <Field label="Label" name="label" defaultValue={item.label} required />
                      <Field label="Link" name="href" defaultValue={item.href} required />
                      <label className="block">
                        <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Location</span>
                        <select name="location" defaultValue={item.location} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                          {LOCATIONS.map((location) => <option key={location.value} value={location.value}>{location.label}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Parent item</span>
                        <select name="parentId" defaultValue={item.parentId ?? ""} className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                          <option value="">Top level</option>
                          {items
                            .filter((parent) => parent.id !== item.id && parent.location === item.location)
                            .map((parent) => <option key={parent.id} value={parent.id}>{parent.label}</option>)}
                        </select>
                      </label>
                      <Field label="Badge (optional)" name="badge" defaultValue={item.badge ?? ""} />
                      <Field label="Sort order" name="sortOrder" type="number" defaultValue={item.sortOrder} />
                      <Toggle label="Active" name="isActive" defaultChecked={item.isActive} />
                      <Toggle label="External link" name="isExternal" defaultChecked={item.isExternal} />
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <AdminSubmit size="sm"><Save className="size-3.5" /> Save</AdminSubmit>
                        <ConfirmAction
                          action={deleteNavItem}
                          fields={{ id: item.id }}
                          message={`Delete “${item.label}” from the menu?`}
                          confirmLabel="Delete"
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[0.65rem] font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-3" /> Delete
                        </ConfirmAction>
                      </div>
                    </form>
                  </details>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <Panel title="Add menu item" description="Create a new link" padded>
          <form action={saveNavItem} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Location</span>
              <select name="location" defaultValue="header" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                {LOCATIONS.map((location) => <option key={location.value} value={location.value}>{location.label}</option>)}
              </select>
            </label>
            <Field label="Label" name="label" placeholder="e.g. Festive Gifts" required />
            <Field label="Link" name="href" placeholder="/products?collection=festive" required />
            <label className="block">
              <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Parent item</span>
              <select name="parentId" defaultValue="" className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem]">
                <option value="">Top level</option>
                {items.filter((item) => item.location === "header").map((parent) => (
                  <option key={parent.id} value={parent.id}>{parent.label}</option>
                ))}
              </select>
            </label>
            <Field label="Badge (optional)" name="badge" placeholder="New" />
            <Field label="Sort order" name="sortOrder" type="number" defaultValue={items.length} />
            <Toggle label="Active" name="isActive" defaultChecked />
            <Toggle label="External link" name="isExternal" />
            <AdminSubmit className="w-full"><Plus className="size-3.5" /> Add item</AdminSubmit>
            <p className="text-[0.6rem] text-[#8b919d]"><Link2 className="mr-1 inline size-3" /> Use absolute URLs for external links.</p>
          </form>
        </Panel>
      </div>
    </div>
  );
}
