import Link from "next/link";
import Image from "next/image";
import { and, asc, count, desc, eq, ilike, or, inArray } from "drizzle-orm";
import { Eye, EyeOff, ImageOff, Plus, Search, Star } from "lucide-react";
import { db } from "@/lib/db";
import { categories, productImages, products } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { bulkProductAction, toggleProductFlag } from "@/app/admin/catalogue-actions";
import { formatINR } from "@/lib/format";
import { PageHeader, Panel, EmptyState, ButtonLink, Tag, Th, Td, TableWrap } from "@/components/admin/ui";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { BulkSelectAll } from "@/components/admin/bulk-select";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCapability("products.manage");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const categoryId = typeof params.category === "string" ? Number(params.category) : 0;
  const status = typeof params.status === "string" ? params.status : "";
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 20;

  const conditions = [eq(products.productType, "product")];
  if (q) conditions.push(or(ilike(products.name, `%${q}%`), ilike(products.sku, `%${q}%`))!);
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));
  if (status === "active") conditions.push(eq(products.isActive, true));
  if (status === "inactive") conditions.push(eq(products.isActive, false));
  if (status === "featured") conditions.push(eq(products.isFeatured, true));
  if (status === "archived") conditions.push(eq(products.isArchived, true));
  else conditions.push(eq(products.isArchived, false));

  const where = and(...conditions);

  const [rows, categoryRows, totalRow] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        pricePaise: products.pricePaise,
        discountPricePaise: products.discountPricePaise,
        minOrderQty: products.minOrderQty,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isArchived: products.isArchived,
        viewCount: products.viewCount,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(asc(products.sortOrder), desc(products.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.kind, "product")).orderBy(asc(categories.sortOrder)),
    db.select({ value: count() }).from(products).where(where),
  ]);

  const ids = rows.map((row) => row.id);
  const images = ids.length
    ? await db
        .select({ productId: productImages.productId, url: productImages.url, sortOrder: productImages.sortOrder })
        .from(productImages)
        .where(inArray(productImages.productId, ids))
        .orderBy(asc(productImages.sortOrder))
    : [];
  const imageMap = new Map<number, string>();
  for (const image of images) if (!imageMap.has(image.productId)) imageMap.set(image.productId, image.url);

  const total = Number(totalRow[0].value);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (categoryId) query.set("category", String(categoryId));
    if (status) query.set("status", status);
    query.set("page", String(nextPage));
    return `/admin/products?${query.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catalogue"
        title="Product Management"
        description={`${total} product${total === 1 ? "" : "s"} in this view. Manage pricing, imagery, availability and visibility.`}
        actions={
          <>
            <ButtonLink href="/admin/categories" variant="ghost">Categories</ButtonLink>
            <ButtonLink href="/admin/products/new">
              <Plus className="size-3.5" /> Add product
            </ButtonLink>
          </>
        }
      />

      <Panel>
        <form method="get" className="flex flex-wrap items-end gap-2 border-b border-black/6 p-3">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-black/30" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name or SKU…"
              className="w-full rounded-lg border border-black/10 bg-white py-2 pl-8 pr-3 text-[0.75rem] outline-none focus:border-[#0d1f3c]"
            />
          </label>
          <select name="category" defaultValue={categoryId || ""} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[0.72rem] outline-none">
            <option value="">All categories</option>
            {categoryRows.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={status} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[0.72rem] outline-none">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="archived">Archived</option>
          </select>
          <button type="submit" className="rounded-lg bg-[#0d1f3c] px-3 py-2 text-[0.7rem] font-semibold text-white hover:bg-[#1b3358]">
            Filter
          </button>
          {(q || categoryId || status) && (
            <Link href="/admin/products" className="text-[0.68rem] text-[#8b919d] hover:text-[#0d1f3c]">Reset</Link>
          )}
        </form>

        {rows.length === 0 ? (
          <EmptyState
            title="No products found"
            description={q || categoryId || status ? "Try a different search or filter." : "Add your first product to get started."}
            action={<ButtonLink href="/admin/products/new"><Plus className="size-3.5" /> Add product</ButtonLink>}
          />
        ) : (
          <form action={bulkProductAction}>
            <div className="flex flex-wrap items-center gap-2 border-b border-black/6 bg-black/[0.015] px-3 py-2">
              <select name="bulkAction" className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[0.68rem] outline-none">
                <option value="activate">Set active</option>
                <option value="deactivate">Set inactive</option>
                <option value="feature">Mark featured</option>
                <option value="unfeature">Remove featured</option>
                <option value="archive">Archive</option>
                <option value="delete">Delete</option>
              </select>
              <AdminSubmit size="sm" variant="ghost">Apply to selected</AdminSubmit>
              <span className="text-[0.62rem] text-[#8b919d]">Tick rows to bulk edit.</span>
            </div>

            <TableWrap>
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr>
                    <Th className="w-8"><BulkSelectAll total={rows.length} /></Th>
                    <Th>Product</Th>
                    <Th>Category</Th>
                    <Th>Price</Th>
                    <Th>Views</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-black/[0.015]">
                      <Td><input type="checkbox" name="ids" value={row.id} aria-label={`Select ${row.name}`} className="size-3.5 accent-[#0d1f3c]" /></Td>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <span className="relative size-9 shrink-0 overflow-hidden rounded-md border border-black/8 bg-black/4">
                            {imageMap.get(row.id) ? (
                              <Image src={imageMap.get(row.id)!} alt="" fill sizes="36px" className="object-cover" unoptimized />
                            ) : (
                              <span className="grid size-full place-items-center text-black/20"><ImageOff className="size-3.5" /></span>
                            )}
                          </span>
                          <div className="min-w-0">
                            <Link href={`/admin/products/${row.id}`} className="block max-w-[240px] truncate text-[0.76rem] font-medium text-[#14161a] hover:text-[#0d1f3c]">
                              {row.name}
                            </Link>
                            <p className="text-[0.6rem] text-[#8b919d]">{row.sku} · MOQ {row.minOrderQty}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="text-[0.7rem]">{row.categoryName}</Td>
                      <Td>
                        <span className="text-[0.72rem] font-medium text-[#14161a]">{formatINR(row.pricePaise)}</span>
                        {row.discountPricePaise ? (
                          <span className="ml-1 text-[0.6rem] text-emerald-700">{formatINR(row.discountPricePaise)}</span>
                        ) : null}
                      </Td>
                      <Td className="text-[0.7rem]">{row.viewCount}</Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {row.isArchived ? <Tag tone="neutral">Archived</Tag> : row.isActive ? <Tag tone="green">Active</Tag> : <Tag tone="red">Inactive</Tag>}
                          {row.isFeatured && <Tag tone="gold">Featured</Tag>}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-1">
                          <Toggle action={toggleProductFlag} id={row.id} field="isActive" active={row.isActive} label={row.isActive ? "Hide" : "Show"} icon={row.isActive ? Eye : EyeOff} />
                          <Toggle action={toggleProductFlag} id={row.id} field="isFeatured" active={row.isFeatured} label="Feature" icon={Star} />
                          <Link href={`/admin/products/${row.id}`} className="rounded-md px-2 py-1 text-[0.62rem] font-semibold text-[#0d1f3c] hover:bg-[#0d1f3c]/5">
                            Edit
                          </Link>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </form>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/6 px-3 py-2.5">
            <p className="text-[0.65rem] text-[#8b919d]">Page {page} of {totalPages}</p>
            <div className="flex gap-1.5">
              {page > 1 && <Link href={buildHref(page - 1)} className="rounded-md border border-black/10 px-2.5 py-1 text-[0.65rem] hover:border-black/25">Previous</Link>}
              {page < totalPages && <Link href={buildHref(page + 1)} className="rounded-md border border-black/10 px-2.5 py-1 text-[0.65rem] hover:border-black/25">Next</Link>}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Toggle({
  action,
  id,
  field,
  active,
  label,
  icon: Icon,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  field: string;
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <button
        type="submit"
        title={label}
        aria-label={label}
        className={`grid size-6 place-items-center rounded-md transition-colors ${
          active ? "bg-[#c3a068]/15 text-[#8a6a33] hover:bg-[#c3a068]/25" : "text-black/30 hover:bg-black/5 hover:text-black/60"
        }`}
      >
        <Icon className="size-3" />
      </button>
    </form>
  );
}
