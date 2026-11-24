"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import type { Category } from "@/lib/db/schema";
import { ImageField } from "@/components/admin/image-field";
import { AdminSubmit } from "@/components/admin/admin-submit";

export type ProductFormValues = {
  id?: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  categoryId: number;
  pricePaise: number | null;
  discountPricePaise: number | null;
  material: string | null;
  size: string | null;
  tags: string[];
  collection: string | null;
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
  isArchived: boolean;
  images: { url: string }[];
};

function rupees(paise: number | null) {
  if (paise === null || paise === undefined) return "";
  return (paise / 100).toFixed(0);
}

export function ProductForm({
  categories,
  customizationOptions,
  product,
  action,
  isHamper = false,
}: {
  categories: Category[];
  customizationOptions: { id: number; name: string }[];
  product?: ProductFormValues;
  action: (formData: FormData) => void | Promise<void>;
  isHamper?: boolean;
}) {
  const label = isHamper ? "hamper" : "product";

  return (
    <form action={action} className="space-y-5">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="productType" value={isHamper ? "hamper" : product?.productType ?? "product"} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={isHamper ? "/admin/hampers" : "/admin/products"}
            className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-[#8b919d] hover:text-[#0d1f3c]"
          >
            <ArrowLeft className="size-3" /> Back to {isHamper ? "hampers" : "products"}
          </Link>
          <h1 className="mt-1 text-[1.5rem] font-semibold tracking-[-0.02em] text-[#14161a]">
            {product ? `Edit ${label}` : `Add a ${label}`}
          </h1>
          <p className="mt-0.5 text-[0.72rem] text-[#8b919d]">Changes are saved immediately to the live catalogue.</p>
        </div>
        <AdminSubmit>
          <Save className="size-3.5" /> {product ? "Save changes" : `Create ${label}`}
        </AdminSubmit>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-5">
          <section className="rounded-xl border border-black/7 bg-white p-4 md:p-5">
            <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a07f45]">Basics</h2>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Name</span>
                <input
                  name="name"
                  required
                  defaultValue={product?.name ?? ""}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-[0.82rem] outline-none focus:border-[#0d1f3c] focus:ring-2 focus:ring-[#0d1f3c]/10"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="SKU / Product ID" name="sku" defaultValue={product?.sku} placeholder="RE-101P" />
                <Field label="URL slug (optional)" name="slug" defaultValue={product?.slug} placeholder="auto-generated" />
              </div>
              <TextArea label="Short description" name="shortDescription" defaultValue={product?.shortDescription} rows={2} />
              <TextArea label="Full description" name="description" defaultValue={product?.description} rows={5} />
            </div>
          </section>

          <section className="rounded-xl border border-black/7 bg-white p-4 md:p-5">
            <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a07f45]">Pricing & availability</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Price (₹)" name="price" type="number" step="1" min="0" defaultValue={rupees(product?.pricePaise ?? null)} />
              <Field label="Discounted price (₹)" name="discountPrice" type="number" step="1" min="0" defaultValue={rupees(product?.discountPricePaise ?? null)} hint="Optional" />
              <Field label="Minimum order qty" name="minOrderQty" type="number" min="1" defaultValue={product?.minOrderQty ?? 10} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Select
                label="Availability"
                name="availability"
                defaultValue={product?.availability ?? "in_stock"}
                options={[
                  { value: "in_stock", label: "In stock" },
                  { value: "made_to_order", label: "Made to order" },
                  { value: "out_of_stock", label: "Out of stock" },
                  { value: "discontinued", label: "Discontinued" },
                ]}
              />
              <Select
                label="Collection"
                name="collection"
                defaultValue={product?.collection ?? ""}
                options={[
                  { value: "", label: "None" },
                  { value: "festival", label: "Festival" },
                  { value: "corporate", label: "Corporate" },
                  { value: "executive", label: "Executive" },
                  { value: "seasonal", label: "Seasonal" },
                  { value: "employee", label: "Employee gifting" },
                ]}
              />
            </div>
          </section>

          <section className="rounded-xl border border-black/7 bg-white p-4 md:p-5">
            <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a07f45]">Details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Material" name="material" defaultValue={product?.material} placeholder="Leatherette, metal…" />
              <Field label="Size" name="size" defaultValue={product?.size} placeholder="A5, 21 × 14 cm" />
              <Field label="Colours (comma separated)" name="colors" defaultValue={product?.colors.join(", ")} className="sm:col-span-2" />
              <Field label="Tags (comma separated)" name="tags" defaultValue={product?.tags.join(", ")} className="sm:col-span-2" />
              <TextArea
                label="Specifications (one per line, Label: Value)"
                name="specifications"
                defaultValue={product?.specifications.map((spec) => `${spec.label}: ${spec.value}`).join("\n")}
                rows={4}
                className="sm:col-span-2"
              />
              <TextArea
                label={isHamper ? "Hamper contents (one per line)" : "Box contents (one per line)"}
                name="contents"
                defaultValue={product?.contents.join("\n")}
                rows={isHamper ? 4 : 3}
                className="sm:col-span-2"
              />
              <Field label="Packaging" name="packaging" defaultValue={product?.packaging} className="sm:col-span-2" />
            </div>

            <div className="mt-3">
              <span className="mb-1.5 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                Customisation options
              </span>
              <div className="flex flex-wrap gap-2">
                {customizationOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-1.5 rounded-lg border border-black/10 px-2.5 py-1.5 text-[0.7rem]">
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
          </section>

          <section className="rounded-xl border border-black/7 bg-white p-4 md:p-5">
            <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a07f45]">Images</h2>
            <ImageField initial={product?.images.map((image) => image.url) ?? []} />
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-black/7 bg-white p-4 md:p-5">
            <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a07f45]">Organisation</h2>
            <div className="space-y-3">
              <Select
                label="Category"
                name="categoryId"
                defaultValue={product?.categoryId ?? ""}
                options={[{ value: "", label: "Choose a category" }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
              />
              <div className="space-y-2">
                <Check label="Featured on homepage" name="isFeatured" defaultChecked={product?.isFeatured ?? false} />
                <Check label="Active (visible on site)" name="isActive" defaultChecked={product?.isActive ?? true} />
                <Check label="Archived" name="isArchived" defaultChecked={product?.isArchived ?? false} hint="Hidden from catalogue and admin lists by default." />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#0d1f3c]/10 bg-[#0d1f3c]/[0.02] p-4">
            <p className="text-[0.68rem] font-semibold text-[#0d1f3c]">Tips</p>
            <ul className="mt-2 space-y-1.5 text-[0.65rem] leading-relaxed text-[#5c6270]">
              <li>· The first image becomes the catalogue thumbnail.</li>
              <li>· Leave price blank to show &ldquo;Price on request&rdquo;.</li>
              <li>· Discounted price is shown as a strikethrough saving.</li>
              <li>· Use tags to power search and filtering.</li>
            </ul>
          </section>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  step,
  min,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        min={min}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem] outline-none focus:border-[#0d1f3c] focus:ring-2 focus:ring-[#0d1f3c]/10"
      />
      {hint && <span className="mt-1 block text-[0.6rem] text-[#8b919d]">{hint}</span>}
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem] leading-relaxed outline-none focus:border-[#0d1f3c] focus:ring-2 focus:ring-[#0d1f3c]/10"
      />
      {hint && <span className="mt-1 block text-[0.6rem] text-[#8b919d]">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  options: { value: string | number; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem] outline-none focus:border-[#0d1f3c]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Check({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-2 rounded-lg border border-black/8 px-2.5 py-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-3.5 accent-[#0d1f3c]" />
      <span>
        <span className="block text-[0.72rem] font-medium text-[#14161a]">{label}</span>
        {hint && <span className="block text-[0.6rem] text-[#8b919d]">{hint}</span>}
      </span>
    </label>
  );
}
