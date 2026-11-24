"use client";

import { useState } from "react";
import Link from "next/link";
import { GripVertical, Save } from "lucide-react";
import { AdminSubmit } from "@/components/admin/admin-submit";
import { Tag } from "@/components/admin/ui";

export type SortableItem = {
  id: number;
  label: string;
  meta?: string;
  enabled: boolean;
  href?: string;
};

export function SortableList({
  items,
  reorderAction,
  toggleAction,
  toggleField = "isEnabled",
  emptyLabel = "Nothing here yet.",
}: {
  items: SortableItem[];
  reorderAction: (formData: FormData) => void | Promise<void>;
  toggleAction?: (formData: FormData) => void | Promise<void>;
  toggleField?: string;
  emptyLabel?: string;
}) {
  const [order, setOrder] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
  }

  if (order.length === 0) {
    return <p className="px-4 py-10 text-center text-[0.75rem] text-[#8b919d]">{emptyLabel}</p>;
  }

  return (
    <form action={reorderAction}>
      <input type="hidden" name="order" value={order.map((item) => item.id).join(",")} />
      <ul className="divide-y divide-black/5">
        {order.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
            }}
            className="flex items-center gap-2.5 bg-white px-3 py-2.5 transition-colors hover:bg-black/[0.015]"
          >
            <span className="cursor-grab text-black/25" aria-hidden="true">
              <GripVertical className="size-4" />
            </span>
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-black/5 text-[0.58rem] font-semibold text-[#6b7280]">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              {item.href ? (
                <Link href={item.href} className="block truncate text-[0.78rem] font-medium text-[#14161a] hover:text-[#0d1f3c]">
                  {item.label}
                </Link>
              ) : (
                <p className="truncate text-[0.78rem] font-medium text-[#14161a]">{item.label}</p>
              )}
              {item.meta && <p className="truncate text-[0.62rem] text-[#8b919d]">{item.meta}</p>}
            </div>
            <Tag tone={item.enabled ? "green" : "neutral"}>{item.enabled ? "Enabled" : "Hidden"}</Tag>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                aria-label="Move up"
                className="grid size-6 place-items-center rounded-md text-black/35 hover:bg-black/5 hover:text-black"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                aria-label="Move down"
                className="grid size-6 place-items-center rounded-md text-black/35 hover:bg-black/5 hover:text-black"
              >
                ↓
              </button>
            </div>
            {toggleAction && (
              <span onClick={(event) => event.stopPropagation()}>
                <ToggleMini action={toggleAction} id={item.id} field={toggleField} enabled={item.enabled} />
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-black/6 px-3 py-2.5">
        <p className="text-[0.62rem] text-[#8b919d]">Drag rows or use the arrows to reorder.</p>
        <AdminSubmit size="sm">
          <Save className="size-3" /> Save order
        </AdminSubmit>
      </div>
    </form>
  );
}

function ToggleMini({
  action,
  id,
  field,
  enabled,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  field: string;
  enabled: boolean;
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <button
        type="submit"
        className={`rounded-full border px-2 py-0.5 text-[0.58rem] font-medium transition-colors ${
          enabled
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-black/10 bg-white text-[#6b7280] hover:bg-black/5"
        }`}
      >
        {enabled ? "On" : "Off"}
      </button>
    </form>
  );
}
