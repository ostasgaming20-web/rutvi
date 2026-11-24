import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, customizationOptions } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { createProduct } from "@/app/admin/catalogue-actions";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireCapability("products.manage");
  const [categoryRows, options] = await Promise.all([
    db.select().from(categories).where(eq(categories.kind, "product")).orderBy(asc(categories.sortOrder)),
    db.select().from(customizationOptions).orderBy(asc(customizationOptions.sortOrder)),
  ]);

  return (
    <ProductForm
      categories={categoryRows}
      customizationOptions={options.map((option) => ({ id: option.id, name: option.name }))}
      action={createProduct}
    />
  );
}
