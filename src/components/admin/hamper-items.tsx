"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { AdminSubmit } from "@/components/admin/admin-submit";

type Item = { name: string; description: string; quantity: number; imageUrl: string };

export function HamperItemsEditor({
  hamperId,
  initial,
  action,
}: {
  hamperId: number;
  initial: { name: string; description: string | null; quantity: number; imageUrl: string | null }[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [items, setItems] = useState<Item[]>(
    initial.length > 0
      ? initial.map((item) => ({ name: item.name, description: item.description ?? "", quantity: item.quantity, imageUrl: item.imageUrl ?? "" }))
      : [{ name: "", description: "", quantity: 1, imageUrl: "" }],
  );
  const [uploading, setUploading] = useState<number | null>(null);

  function update(index: number, patch: Partial<Item>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function upload(index: number, file: File) {
    setUploading(index);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", "hampers");
    try {
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Upload failed.");
      update(index, { imageUrl: payload.url });
    } catch {
      /* surfaced by the browser */
    } finally {
      setUploading(null);
    }
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="hamperId" value={hamperId} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-black/8 bg-white p-2.5">
            <div className="flex items-center gap-2">
              <span className="cursor-grab text-black/20"><GripVertical className="size-3.5" /></span>
              <span className="relative size-9 shrink-0 overflow-hidden rounded-md border border-black/8 bg-black/4">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="36px" className="object-cover" unoptimized />
                ) : (
                  <span className="grid size-full place-items-center text-[0.5rem] text-black/25">IMG</span>
                )}
              </span>
              <input
                value={item.name}
                onChange={(event) => update(index, { name: event.target.value })}
                placeholder="Item name (e.g. Leather diary)"
                className="min-w-0 flex-1 rounded-md border border-black/10 px-2 py-1.5 text-[0.72rem] outline-none focus:border-[#0d1f3c]"
              />
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => update(index, { quantity: Number(event.target.value) })}
                aria-label="Quantity"
                className="w-14 rounded-md border border-black/10 px-2 py-1.5 text-[0.72rem] outline-none focus:border-[#0d1f3c]"
              />
              <label className="cursor-pointer rounded-md border border-black/10 px-2 py-1.5 text-[0.6rem] hover:border-black/25">
                {uploading === index ? "…" : "Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(index, file);
                    event.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                aria-label="Remove item"
                className="grid size-7 place-items-center rounded-md text-black/30 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
            <input
              value={item.description}
              onChange={(event) => update(index, { description: event.target.value })}
              placeholder="Short description (optional)"
              className="mt-1.5 w-full rounded-md border border-black/10 px-2 py-1 text-[0.65rem] outline-none focus:border-[#0d1f3c]"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-black/6 pt-3">
        <button
          type="button"
          onClick={() => setItems((current) => [...current, { name: "", description: "", quantity: 1, imageUrl: "" }])}
          className="inline-flex items-center gap-1 rounded-lg border border-black/12 px-2.5 py-1.5 text-[0.66rem] font-semibold text-[#3f4552] hover:border-black/25"
        >
          <Plus className="size-3" /> Add item
        </button>
        <AdminSubmit size="sm">
          <Save className="size-3" /> Save contents
        </AdminSubmit>
      </div>
    </form>
  );
}
