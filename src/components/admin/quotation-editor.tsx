"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveQuotation } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/submit-button";
import { QUOTATION_STATUSES, QUOTATION_STATUS_LABELS, formatINR } from "@/lib/format";

type Row = {
  key: string;
  productId: number | null;
  description: string;
  quantity: number;
  unitPrice: string;
};

export function QuotationEditor({
  quotation,
  items,
}: {
  quotation: {
    id: number;
    status: string;
    taxPaise: number;
    deliveryPaise: number;
    validUntil: string;
    notes: string;
  };
  items: { productId: number | null; description: string; quantity: number; unitPricePaise: number }[];
}) {
  const [rows, setRows] = useState<Row[]>(
    items.length
      ? items.map((item, index) => ({
          key: `row-${index}`,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: (item.unitPricePaise / 100).toString(),
        }))
      : [{ key: "row-0", productId: null, description: "", quantity: 1, unitPrice: "" }],
  );
  const [tax, setTax] = useState((quotation.taxPaise / 100).toString());
  const [delivery, setDelivery] = useState((quotation.deliveryPaise / 100).toString());

  const subtotalPaise = rows.reduce(
    (sum, row) => sum + Math.round((Number(row.unitPrice) || 0) * 100) * Math.max(1, Number(row.quantity) || 1),
    0,
  );
  const taxPaise = Math.round((Number(tax) || 0) * 100);
  const deliveryPaise = Math.round((Number(delivery) || 0) * 100);
  const totalPaise = subtotalPaise + taxPaise + deliveryPaise;

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((current) => [
      ...current,
      { key: `row-${Date.now()}`, productId: null, description: "", quantity: 1, unitPrice: "" },
    ]);
  }

  function removeRow(key: string) {
    setRows((current) => (current.length === 1 ? current : current.filter((row) => row.key !== key)));
  }

  const serialized = JSON.stringify(
    rows.map((row) => ({
      description: row.description,
      quantity: Number(row.quantity) || 1,
      unitPrice: Number(row.unitPrice) || 0,
    })),
  );

  return (
    <form action={saveQuotation} className="space-y-5">
      <input type="hidden" name="id" value={quotation.id} />
      <input type="hidden" name="items" value={serialized} />

      <section className="surface rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Line items</h2>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink/12 px-2.5 py-1.5 text-[0.6rem] font-medium text-ink hover:border-navy/30"
          >
            <Plus className="size-3.5" /> Add line
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {rows.map((row, index) => (
            <div key={row.key} className="rounded-lg border border-ink/8 bg-cream/20 p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem_auto]">
                <div>
                  <label className="mb-1 block text-[0.55rem] uppercase tracking-[0.12em] text-stone" htmlFor={`desc-${row.key}`}>
                    Description
                  </label>
                  <input
                    id={`desc-${row.key}`}
                    value={row.description}
                    onChange={(event) => updateRow(row.key, { description: event.target.value })}
                    placeholder={`Item ${index + 1} — e.g. Executive pen set with laser engraving`}
                    className="field !min-h-10 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.55rem] uppercase tracking-[0.12em] text-stone" htmlFor={`qty-${row.key}`}>
                    Qty
                  </label>
                  <input
                    id={`qty-${row.key}`}
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(event) => updateRow(row.key, { quantity: Number(event.target.value) })}
                    className="field !min-h-10 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.55rem] uppercase tracking-[0.12em] text-stone" htmlFor={`price-${row.key}`}>
                    Unit price (₹)
                  </label>
                  <input
                    id={`price-${row.key}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.unitPrice}
                    onChange={(event) => updateRow(row.key, { unitPrice: event.target.value })}
                    className="field !min-h-10 text-xs"
                  />
                </div>
                <div className="flex items-end justify-between gap-2 sm:justify-end">
                  <span className="text-xs font-medium text-ink/70 sm:hidden">
                    {formatINR(Math.round((Number(row.unitPrice) || 0) * 100) * Math.max(1, Number(row.quantity) || 1))}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    disabled={rows.length === 1}
                    aria-label={`Remove line ${index + 1}`}
                    className="mb-0.5 inline-flex size-9 items-center justify-center rounded-lg border border-ink/10 text-stone hover:border-red-200 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="surface rounded-xl p-5">
          <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Terms</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="validUntil" className="mb-1 block text-[0.55rem] uppercase tracking-[0.12em] text-stone">
                Valid until
              </label>
              <input id="validUntil" name="validUntil" type="date" defaultValue={quotation.validUntil} className="field !min-h-10 text-xs" />
            </div>
            <div>
              <label htmlFor="notes" className="mb-1 block text-[0.55rem] uppercase tracking-[0.12em] text-stone">
                Notes for the customer
              </label>
              <textarea id="notes" name="notes" rows={5} defaultValue={quotation.notes} className="field text-xs" />
            </div>
            <div>
              <label htmlFor="status" className="mb-1 block text-[0.55rem] uppercase tracking-[0.12em] text-stone">
                Status
              </label>
              <select id="status" name="status" defaultValue={quotation.status} className="field !min-h-10 text-xs">
                {QUOTATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {QUOTATION_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="surface rounded-xl p-5">
          <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold">Totals</h2>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink/60">Subtotal</span>
              <span className="font-medium text-ink">{formatINR(subtotalPaise)}</span>
            </div>
            <div>
              <label htmlFor="tax" className="mb-1 block text-[0.55rem] uppercase tracking-[0.12em] text-stone">
                Tax / GST (₹)
              </label>
              <input
                id="tax"
                name="tax"
                type="number"
                min={0}
                step="0.01"
                value={tax}
                onChange={(event) => setTax(event.target.value)}
                className="field !min-h-10 text-xs"
              />
            </div>
            <div>
              <label htmlFor="delivery" className="mb-1 block text-[0.55rem] uppercase tracking-[0.12em] text-stone">
                Delivery (₹)
              </label>
              <input
                id="delivery"
                name="delivery"
                type="number"
                min={0}
                step="0.01"
                value={delivery}
                onChange={(event) => setDelivery(event.target.value)}
                className="field !min-h-10 text-xs"
              />
            </div>
            <div className="flex items-center justify-between border-t border-ink/10 pt-3">
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink">Total</span>
              <span className="font-display text-xl text-ink">{formatINR(totalPaise)}</span>
            </div>
          </div>
          <SubmitButton className="btn-base btn-navy mt-4 w-full" pendingLabel="Saving…">Save quotation</SubmitButton>
        </section>
      </div>
    </form>
  );
}
