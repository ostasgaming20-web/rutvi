import Link from "next/link";
import Image from "next/image";
import { and, asc, count, desc, eq, ilike, or, inArray } from "drizzle-orm";
import { Gift, ImageOff, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { categories, hamperItems, productImages, products } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { toggleProductFlag } from "@/app/admin/catalogue-actions";
import { formatINR } from "@/lib/format";
import { PageHeader, Panel, EmptyState, ButtonLink, Tag, Th, Td, TableWrap } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function HampersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCapability("hampers.manage");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const collection = typeof params.collection === "string" ? params.collection : "";

  const conditions = [eq(products.productType, "hamper"), eq(products.isArchived, false)];
  if (q) conditions.push(or(ilike(products.name, `%${q}%`), ilike(products.sku, `%${q}%`))!);
  if (collection) conditions.push(eq(products.collection, collection));
  const where = and(...conditions);

  const [rows, itemCounts, totalRow] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        pricePaise: products.pricePaise,
        collection: products.collection,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(desc(products.updatedAt)),
    db.select({ hamperId: hamperItems.hamperId, value: count() }).from(hamperItems).groupBy(hamperItems.hamperId),
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
  const itemMap = new Map(itemCounts.map((row) => [row.hamperId, Number(row.value)]));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catalogue"
        title="Gift Hampers"
        description={`${Number(totalRow[0].value)} hampers. Build curated contents, festival sets and executive collections.`}
        actions={
          <ButtonLink href="/admin/hampers/new">
            <Plus className="size-3.5" /> Create hamper
          </ButtonLink>
        }
      />

      <Panel>
        <form method="get" className="flex flex-wrap items-center gap-2 border-b border-black/6 p-3">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-black/30" />
            <input name="q" defaultValue={q} placeholder="Search hampers…" className="w-full rounded-lg border border-black/10 bg-white py-2 pl-8 pr-3 text-[0.75rem] outline-none focus:border-[#0d1f3c]" />
          </label>
          <select name="collection" defaultValue={collection} className="rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[0.72rem] outline-none">
            <option value="">All collections</option>
            <option value="festival">Festival</option>
            <option value="corporate">Corporate</option>
            <option value="executive">Executive</option>
            <option value="seasonal">Seasonal</option>
            <option value="employee">Employee gifting</option>
          </select>
          <button type="submit" className="rounded-lg bg-[#0d1f3c] px-3 py-2 text-[0.7rem] font-semibold text-white hover:bg-[#1b3358]">Filter</button>
          {(q || collection) && <Link href="/admin/hampers" className="text-[0.68rem] text-[#8b919d] hover:text-[#0d1f3c]">Reset</Link>}
        </form>

        {rows.length === 0 ? (
          <EmptyState
            title="No hampers yet"
            description="Create a hamper, add its contents and publish it to the website."
            icon={Gift}
            action={<ButtonLink href="/admin/hampers/new"><Plus className="size-3.5" /> Create hamper</ButtonLink>}
          />
        ) : (
          <TableWrap>
            <table className="w-full min-w-[680px]">
              <thead>
                <tr>
                  <Th>Hamper</Th>
                  <Th>Collection</Th>
                  <Th>Items</Th>
                  <Th>Price</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-black/[0.015]">
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
                          <Link href={`/admin/hampers/${row.id}`} className="block max-w-[240px] truncate text-[0.76rem] font-medium text-[#14161a] hover:text-[#0d1f3c]">
                            {row.name}
                          </Link>
                          <p className="text-[0.6rem] text-[#8b919d]">{row.sku} · {row.categoryName}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>{row.collection ? <Tag tone="gold">{row.collection}</Tag> : <span className="text-[0.65rem] text-[#8b919d]">—</span>}</Td>
                    <Td className="text-[0.7rem]">{itemMap.get(row.id) ?? 0}</Td>
                    <Td className="text-[0.72rem] font-medium">{formatINR(row.pricePaise)}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {row.isActive ? <Tag tone="green">Active</Tag> : <Tag tone="red">Inactive</Tag>}
                        {row.isFeatured && <Tag tone="gold">Featured</Tag>}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <form action={toggleProductFlag} className="inline">
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="field" value="isActive" />
                          <button type="submit" className="rounded-md px-2 py-1 text-[0.62rem] font-semibold text-[#6b7280] hover:bg-black/5">
                            {row.isActive ? "Hide" : "Show"}
                          </button>
                        </form>
                        <Link href={`/admin/hampers/${row.id}`} className="rounded-md px-2 py-1 text-[0.62rem] font-semibold text-[#0d1f3c] hover:bg-[#0d1f3c]/5">
                          Manage
                        </Link>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>
    </div>
  );
}
