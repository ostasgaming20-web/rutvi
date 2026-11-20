"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import type { Category } from "@/lib/db/schema";
import { ImageField } from "@/components/admin/image-field";
import { SubmitButton } from "@/components/admin/submit-button";

type ProductFormData = {
  id?: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  categoryId: number;
  pricePaise: number | null;
  minOrderQty: number;
  colors: string[];
  specifications: { label: string; value: string }[];
  customizationOptions: string[];
  contents: string[];
  packaging: string | null;
  productType: string;
  availability: string;
  isFeatured: boolean;
  isActive: boolean;
  images: { url: string }[];
};

export function ProductForm({
  categories,
  customizationOptions,
  product,
  action,
}: {
  categories: Category[];
  customizationOptions: { id: number; name: string }[];
  product?: ProductFormData;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="space-y-5">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-stone hover:text-navy">
            <ArrowLeft className="size-3" /> Back to products
          </Link>
          <h1 className="display mt-2 text-3xl text-ink">{product ? "Edit product" : "Add a product"}</h1>
          <p className="mt-1 text-xs text-stone">Changes go live on the website immediately.</p>
        </div>
        <SubmitButton>
          <Save className="size-4" /> {product ? "Save changes" : "Create product"}
        </SubmitButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/60">Basics</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="name">Product name *</label>
                <input id="name" name="name" defaultValue={product?.name} className="field" required />
              </div>
              <div>
                <label className="field-label" htmlFor="sku">SKU *</label>
                <input id="sku" name="sku" defaultValue={product?.sku} className="field" required />
              </div>
              <div>
                <label className="field-label" htmlFor="slug">URL slug</label>
                <input id="slug" name="slug" defaultValue={product?.slug} className="field" placeholder="auto from name" />
              </div>
              <div>
                <label className="field-label" htmlFor="categoryId">Category *</label>
                <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} className="field" required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} {category.kind === "hamper" ? "(hamper)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="productType">Type</label>
                <select id="productType" name="productType" defaultValue={product?.productType ?? "product"} className="field">
                  <option value="product">Product</option>
                  <option value="hamper">Hamper</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="shortDescription">Short description</label>
                <input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} className="field" maxLength={180} />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="description">Full description</label>
                <textarea id="description" name="description" defaultValue={product?.description ?? ""} rows={5} className="field resize-y" />
              </div>
            </div>
          </section>

          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/60">Pricing &amp; order</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="field-label" htmlFor="price">Price per unit (₹)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="1"
                  defaultValue={product?.pricePaise ? product.pricePaise / 100 : ""}
                  className="field"
                  placeholder="Leave blank for on request"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="minOrderQty">Minimum order qty</label>
                <input id="minOrderQty" name="minOrderQty" type="number" min={1} defaultValue={product?.minOrderQty ?? 10} className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor="availability">Availability</label>
                <select id="availability" name="availability" defaultValue={product?.availability ?? "in_stock"} className="field">
                  <option value="in_stock">In stock</option>
                  <option value="made_to_order">Made to order</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
              </div>
            </div>
          </section>

          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/60">Customisation &amp; contents</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="field-label" htmlFor="colors">Available colours</label>
                <input id="colors" name="colors" defaultValue={product?.colors.join(", ")} className="field" placeholder="Navy, Ivory, Charcoal" />
                <p className="mt-1 text-[0.6rem] text-stone">Comma-separated.</p>
              </div>
              <div>
                <span className="field-label">Customisation options</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {customizationOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-xs text-ink/70">
                      <input
                        type="checkbox"
                        name="customizationOptions"
                        value={option.name}
                        defaultChecked={product?.customizationOptions.includes(option.name)}
                        className="size-3.5 accent-[#0d1f3c]"
                      />
                      {option.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="specifications">Specifications</label>
                <textarea
                  id="specifications"
                  name="specifications"
                  rows={4}
                  defaultValue={product?.specifications.map((spec) => `${spec.label}: ${spec.value}`).join("\n")}
                  className="field resize-y"
                  placeholder={"Material: Full-grain leather\nSize: A5\nBranding: Deboss"}
                />
                <p className="mt-1 text-[0.6rem] text-stone">One per line, formatted as Label: Value.</p>
              </div>
              <div>
                <label className="field-label" htmlFor="contents">Hamper contents</label>
                <textarea id="contents" name="contents" rows={3} defaultValue={product?.contents.join("\n")} className="field resize-y" placeholder="One item per line" />
              </div>
              <div>
                <label className="field-label" htmlFor="packaging">Packaging details</label>
                <textarea id="packaging" name="packaging" rows={2} defaultValue={product?.packaging ?? ""} className="field resize-y" />
              </div>
            </div>
          </section>

          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/60">Images</h2>
            <div className="mt-4">
              <ImageField initial={product?.images.map((image) => image.url)} />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="surface rounded-xl p-5">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/60">Visibility</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2 text-xs text-ink/70">
                <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="size-3.5 accent-[#0d1f3c]" />
                Published on website
              </label>
              <label className="flex items-center gap-2 text-xs text-ink/70">
                <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="size-3.5 accent-[#0d1f3c]" />
                Feature on homepage
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-gold/30 bg-gold/8 p-5">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#7a5c28]">Preview</p>
            <p className="mt-2 text-xs leading-relaxed text-ink/60">
              {product ? "Saving will update the live product page and any category listings." : "The product will appear in the catalogue as soon as it is published."}
            </p>
          </section>

          <div className="lg:hidden">
            <SubmitButton className="btn-base btn-navy w-full">
              <Save className="size-4" /> {product ? "Save changes" : "Create product"}
            </SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
}
