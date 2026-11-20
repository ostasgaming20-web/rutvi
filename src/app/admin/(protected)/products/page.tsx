import Link from "next/link";
import Image from "next/image";
import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { ArrowUpRight, Eye, EyeOff, Plus, Search, Star, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { categories, productImages, products } from "@/lib/db/schema";
import { formatINR } from "@/lib/format";
import { deleteProduct, toggleProductFlag } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const categoryId = typeof params.category === "string" ? Number(params.category) : 0;

  const conditions = [];
  if (q) conditions.push(or(ilike(products.name, `%${q}%`), ilike(products.sku, `%${q}%`))!);
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));

  const [rows, categoryRows, totals] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        pricePaise: products.pricePaise,
        minOrderQty: products.minOrderQty,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        productType: products.productType,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(products.sortOrder), asc(products.id)),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
    db.select({ value: count() }).from(products),
  ]);

  const images = rows.length
    ? await db
        .select({ productId: productImages.productId, url: productImages.url, sortOrder: productImages.sortOrder })
        .from(productImages)
        .orderBy(asc(productImages.sortOrder))
    : [];
  const imageMap = new Map<number, string>();
  for (const image of images) if (!imageMap.has(image.productId)) imageMap.set(image.productId, image.url);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold">Catalogue</p>
          <h1 className="display mt-1 text-4xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink/50">{Number(totals[0].value)} products in the catalogue.</p>
        </div>
        <Link href="/admin/products/new" className="btn-base btn-navy !min-h-10 !px-5 !text-[0.65rem]">
          <Plus className="size-4" /> Add product
        </Link>
      </div>

      <form className="surface flex flex-wrap items-center gap-2 rounded-xl p-3" action="/admin/products">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
          <input name="q" defaultValue={q} placeholder="Search products or SKU…" className="field !min-h-10 pl-9 text-xs" aria-label="Search products" />
        </div>
        <select name="category" defaultValue={categoryId || ""} className="field !min-h-10 w-auto text-xs" aria-label="Filter by category">
          <option value="">All categories</option>
          {categoryRows.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <button type="submit" className="btn-base btn-navy !min-h-10 !px-4 !text-[0.62rem]">Filter</button>
        {(q || categoryId) && (
          <Link href="/admin/products" className="text-[0.62rem] uppercase tracking-[0.08em] text-stone underline underline-offset-4">Clear</Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="surface rounded-xl p-12 text-center">
          <p className="text-sm font-medium text-ink">No products match this view.</p>
          <p className="mt-1 text-xs text-stone">Try a different search, or add a new product.</p>
          <Link href="/admin/products/new" className="btn-base btn-navy mt-5">Add product</Link>
        </div>
      ) : (
        <>
          <div className="surface hidden overflow-hidden rounded-xl md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/8 text-[0.58rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">MOQ</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/7">
                {rows.map((product) => (
                  <tr key={product.id} className="text-xs hover:bg-cream/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                          {imageMap.get(product.id) && (
                            <Image src={imageMap.get(product.id)!} alt="" fill sizes="44px" className="object-cover" unoptimized />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${product.id}`} className="block truncate font-medium text-ink hover:text-navy">
                            {product.name}
                          </Link>
                          <p className="text-[0.6rem] text-stone">{product.sku} · {product.productType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{product.categoryName}</td>
                    <td className="px-4 py-3 font-medium text-navy">{formatINR(product.pricePaise)}</td>
                    <td className="px-4 py-3 text-ink/60">{product.minOrderQty}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className={`rounded-full border px-2 py-0.5 text-[0.55rem] ${product.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-stone-200 bg-stone-100 text-stone-600"}`}>
                          {product.isActive ? "Live" : "Hidden"}
                        </span>
                        {product.isFeatured && (
                          <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[0.55rem] text-[#7a5c28]">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <form action={toggleProductFlag}>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="field" value="isActive" />
                          <button type="submit" aria-label={product.isActive ? "Hide product" : "Publish product"} className="grid size-7 place-items-center rounded-md text-stone hover:bg-cream hover:text-navy">
                            {product.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        </form>
                        <form action={toggleProductFlag}>
                          <input type="hidden" name="id" value={product.id} />
                          <input type="hidden" name="field" value="isFeatured" />
                          <button type="submit" aria-label={product.isFeatured ? "Unfeature product" : "Feature product"} className={`grid size-7 place-items-center rounded-md hover:bg-cream ${product.isFeatured ? "text-gold" : "text-stone hover:text-navy"}`}>
                            <Star className="size-3.5" />
                          </button>
                        </form>
                        <Link href={`/products/${product.slug}`} target="_blank" aria-label="View product" className="grid size-7 place-items-center rounded-md text-stone hover:bg-cream hover:text-navy">
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                        <Link href={`/admin/products/${product.id}`} className="rounded-md px-2 py-1 text-[0.6rem] font-medium text-navy hover:bg-cream">
                          Edit
                        </Link>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <ConfirmSubmit
                            message={`Delete "${product.name}"? This removes it from the website and cannot be undone.`}
                            className="grid size-7 place-items-center rounded-md text-stone hover:bg-red-50 hover:text-red-700"
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {rows.map((product) => (
              <div key={product.id} className="surface rounded-xl p-3">
                <div className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {imageMap.get(product.id) && <Image src={imageMap.get(product.id)!} alt="" fill sizes="56px" className="object-cover" unoptimized />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                    <p className="text-[0.62rem] text-stone">{product.categoryName} · {product.sku}</p>
                    <p className="mt-1 text-xs font-medium text-navy">{formatINR(product.pricePaise)} · MOQ {product.minOrderQty}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-ink/7 pt-2">
                  <Link href={`/admin/products/${product.id}`} className="rounded-md bg-cream px-3 py-1.5 text-[0.62rem] font-medium text-navy">Edit</Link>
                  <form action={toggleProductFlag}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="field" value="isActive" />
                    <button type="submit" className="rounded-md border border-ink/10 px-3 py-1.5 text-[0.62rem] text-ink/60">
                      {product.isActive ? "Hide" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteProduct} className="ml-auto">
                    <input type="hidden" name="id" value={product.id} />
                    <ConfirmSubmit message={`Delete "${product.name}"? This cannot be undone.`} className="grid size-8 place-items-center rounded-md text-stone hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="size-3.5" />
                    </ConfirmSubmit>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
