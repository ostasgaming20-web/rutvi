import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Trash2, Archive } from "lucide-react";
import { db } from "@/lib/db";
import { categories, customizationOptions, productImages, products } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { updateProduct, deleteProduct, archiveProduct } from "@/app/admin/catalogue-actions";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Panel } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCapability("products.manage");
  const { id } = await params;
  const productId = Number(id);
  if (!productId) notFound();

  const [[product], images, categoryRows, options] = await Promise.all([
    db.select().from(products).where(eq(products.id, productId)).limit(1),
    db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder)),
    db.select().from(categories).where(eq(categories.kind, "product")).orderBy(asc(categories.sortOrder)),
    db.select().from(customizationOptions).orderBy(asc(customizationOptions.sortOrder)),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-4">
      <ProductForm
        categories={categoryRows}
        customizationOptions={options.map((option) => ({ id: option.id, name: option.name }))}
        product={{ ...product, images: images.map((image) => ({ url: image.url })) }}
        action={updateProduct}
      />

      <Panel title="Danger zone" description="These actions affect the live catalogue.">
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-black/8 p-3">
            <div>
              <p className="text-[0.75rem] font-medium text-[#14161a]">Archive product</p>
              <p className="text-[0.62rem] text-[#8b919d]">Hide it without losing the record.</p>
            </div>
            <ConfirmAction
              action={archiveProduct}
              fields={{ id: product.id }}
              message={`Archive "${product.name}"? It will be hidden from the catalogue.`}
              confirmLabel="Archive"
              title="Archive product"
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/12 px-2.5 py-1.5 text-[0.65rem] font-semibold text-[#3f4552] hover:border-black/25"
            >
              <Archive className="size-3" /> Archive
            </ConfirmAction>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200/60 bg-red-50/40 p-3">
            <div>
              <p className="text-[0.75rem] font-medium text-red-800">Delete product</p>
              <p className="text-[0.62rem] text-red-700/70">Permanently removes it and its images.</p>
            </div>
            <ConfirmAction
              action={deleteProduct}
              fields={{ id: product.id }}
              message={`Delete "${product.name}"? This cannot be undone.`}
              confirmLabel="Delete"
              title="Delete product"
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-2.5 py-1.5 text-[0.65rem] font-semibold text-red-700 hover:bg-red-100"
            >
              <Trash2 className="size-3" /> Delete
            </ConfirmAction>
          </div>
        </div>
      </Panel>
    </div>
  );
}
