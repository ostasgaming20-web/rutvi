import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, customizationOptions } from "@/lib/db/schema";
import { createProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const [categoryRows, options] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
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
