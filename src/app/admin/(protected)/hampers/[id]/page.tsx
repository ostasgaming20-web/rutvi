import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { categories, customizationOptions, hamperItems, productImages, products } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { updateProduct, saveHamperItems } from "@/app/admin/catalogue-actions";
import { ProductForm } from "@/components/admin/product-form";
import { HamperItemsEditor } from "@/components/admin/hamper-items";
import { Panel, Tag } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function EditHamperPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCapability("hampers.manage");
  const { id } = await params;
  const hamperId = Number(id);
  if (!hamperId) notFound();

  const [[hamper], images, items, categoryRows, options] = await Promise.all([
    db.select().from(products).where(eq(products.id, hamperId)).limit(1),
    db.select().from(productImages).where(eq(productImages.productId, hamperId)).orderBy(asc(productImages.sortOrder)),
    db.select().from(hamperItems).where(eq(hamperItems.hamperId, hamperId)).orderBy(asc(hamperItems.sortOrder)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(customizationOptions).orderBy(asc(customizationOptions.sortOrder)),
  ]);

  if (!hamper) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin/hampers" className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-[#8b919d] hover:text-[#0d1f3c]">
        <ArrowLeft className="size-3" /> All hampers
      </Link>

      <Panel
        title="Hamper contents"
        description="Each item shown on the hamper detail page"
        actions={<Tag tone="gold">{items.length} items</Tag>}
        padded
      >
        <HamperItemsEditor
          hamperId={hamperId}
          initial={items.map((item) => ({ name: item.name, description: item.description, quantity: item.quantity, imageUrl: item.imageUrl }))}
          action={saveHamperItems}
        />
      </Panel>

      <ProductForm
        categories={categoryRows}
        customizationOptions={options.map((option) => ({ id: option.id, name: option.name }))}
        product={{ ...hamper, images: images.map((image) => ({ url: image.url })) }}
        action={updateProduct}
        isHamper
      />
    </div>
  );
}
