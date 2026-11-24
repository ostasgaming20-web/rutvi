import { asc, count, eq, sql } from "drizzle-orm";
import { Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { saveCategory, deleteCategory } from "@/app/admin/catalogue-actions";
import { PageHeader, Panel, EmptyState, Field, TextArea, Select, Toggle, Tag, ButtonLink } from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { MediaField } from "@/components/admin/media-field";
import { ConfirmAction } from "@/components/admin/confirm-action";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCapability("categories.manage");
  const params = await searchParams;
  const editingId = typeof params.edit === "string" ? Number(params.edit) : 0;

  const [rows, counts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.kind), asc(categories.sortOrder)),
    db
      .select({ categoryId: products.categoryId, value: count() })
      .from(products)
      .groupBy(products.categoryId),
  ]);

  const countMap = new Map(counts.map((row) => [row.categoryId, Number(row.value)]));
  const editing = rows.find((row) => row.id === editingId);
  const parents = rows.filter((row) => row.kind === "product");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catalogue"
        title="Categories & Collections"
        description="Organise products and hampers into the collections shown across the website."
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <Panel title="All categories" description={`${rows.length} categories`}>
          {rows.length === 0 ? (
            <EmptyState title="No categories yet" description="Create your first category using the form." />
          ) : (
            <ul className="divide-y divide-black/5">
              {rows.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-black/[0.015]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[0.78rem] font-medium text-[#14161a]">{row.name}</p>
                      <Tag tone={row.kind === "hamper" ? "gold" : "blue"}>{row.kind}</Tag>
                      {!row.isActive && <Tag tone="neutral">Hidden</Tag>}
                    </div>
                    <p className="truncate text-[0.62rem] text-[#8b919d]">
                      /{row.slug} · {countMap.get(row.id) ?? 0} items
                      {row.parentId ? ` · under ${rows.find((parent) => parent.id === row.parentId)?.name ?? "parent"}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <ButtonLink href={`/admin/categories?edit=${row.id}`} variant="ghost" className="!px-2 !py-1 !text-[0.62rem]">
                      Edit
                    </ButtonLink>
                    <ConfirmAction
                      action={deleteCategory}
                      fields={{ id: row.id }}
                      message={`Delete "${row.name}"? Only empty categories can be removed.`}
                      confirmLabel="Delete"
                      title="Delete category"
                      className="grid size-6 place-items-center rounded-md text-black/30 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-3" />
                    </ConfirmAction>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={editing ? `Edit: ${editing.name}` : "Add a category"} description="Changes reflect on the website immediately." padded>
          <form action={saveCategory} className="space-y-3">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Name" name="name" defaultValue={editing?.name} required />
            <Field label="Slug (optional)" name="slug" defaultValue={editing?.slug} placeholder="auto-generated" />
            <TextArea label="Description" name="description" defaultValue={editing?.description} rows={2} />
            <MediaField name="imageUrl" label="Category image" defaultValue={editing?.imageUrl} folder="categories" />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Type"
                name="kind"
                defaultValue={editing?.kind ?? "product"}
                options={[
                  { value: "product", label: "Product" },
                  { value: "hamper", label: "Hamper" },
                ]}
              />
              <Field label="Sort order" name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} />
            </div>
            <Select
              label="Parent category (optional)"
              name="parentId"
              defaultValue={editing?.parentId ?? ""}
              options={[{ value: "", label: "None — top level" }, ...parents.filter((parent) => parent.id !== editing?.id).map((parent) => ({ value: parent.id, label: parent.name }))]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Meta title" name="metaTitle" defaultValue={editing?.metaTitle} />
              <Field label="Meta description" name="metaDescription" defaultValue={editing?.metaDescription} />
            </div>
            <Toggle label="Active" name="isActive" defaultChecked={editing?.isActive ?? true} hint="Hidden categories do not appear on the website." />
            <div className="flex items-center justify-between border-t border-black/6 pt-3">
              {editing ? (
                <ButtonLink href="/admin/categories" variant="ghost" className="!text-[0.68rem]">Cancel</ButtonLink>
              ) : <span />}
              <AdminSubmit>
                <Plus className="size-3.5" /> {editing ? "Save category" : "Add category"}
              </AdminSubmit>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
