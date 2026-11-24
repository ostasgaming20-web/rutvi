import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, customizationOptions } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { createProduct } from "@/app/admin/catalogue-actions";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewHamperPage() {
  await requireCapability("hampers.manage");
  const [categoryRows, options] = await Promise.all([
    db.select().from(categories).where(eq(categories.kind, "hamper")).orderBy(asc(categories.sortOrder)),
    db.select().from(customizationOptions).orderBy(asc(customizationOptions.sortOrder)),
  ]);

  return (
    <ProductForm
      categories={categoryRows.length > 0 ? categoryRows : await db.select().from(categories).orderBy(asc(categories.sortOrder))}
      customizationOptions={options.map((option) => ({ id: option.id, name: option.name }))}
      action={createProduct}
      isHamper
    />
  );
}
