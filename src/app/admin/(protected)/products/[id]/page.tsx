import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, customizationOptions, productImages, products } from "@/lib/db/schema";
import { updateProduct, deleteProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Trash2 } from "lucide-react";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!productId) notFound();

  const [[product], images, categoryRows, options] = await Promise.all([
    db.select().from(products).where(eq(products.id, productId)).limit(1),
    db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
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
      <div className="surface flex flex-col items-start justify-between gap-3 rounded-xl p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-ink">Delete this product</p>
          <p className="mt-0.5 text-[0.65rem] text-stone">Removes it from the website. Existing quotations keep their line items.</p>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmit
            message={`Delete "${product.name}"? This cannot be undone.`}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-[0.65rem] font-medium text-red-700 hover:bg-red-50"
          >
            <Trash2 className="size-3.5" /> Delete product
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
