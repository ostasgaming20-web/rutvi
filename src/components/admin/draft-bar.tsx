"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Loader2, RotateCcw, Send, Undo2, X } from "lucide-react";
import { toast } from "sonner";

export function DraftBar({
  scope,
  returnTo,
  hasDraft,
  publishedAt,
  publishedBy,
  canPublish,
  publishAction,
  discardAction,
  previewAction,
  disabled,
}: {
  scope: string;
  returnTo: string;
  hasDraft: boolean;
  publishedAt?: string | null;
  publishedBy?: string | null;
  canPublish: boolean;
  publishAction: (formData: FormData) => void | Promise<void>;
  discardAction: (formData: FormData) => void | Promise<void>;
  previewAction?: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <div className="sticky top-14 z-20 -mx-4 mb-5 border-y border-black/7 bg-white/85 px-4 py-2.5 backdrop-blur-xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold ${
              hasDraft
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {hasDraft ? <RotateCcw className="size-3" /> : <CheckCircle2 className="size-3" />}
            {hasDraft ? "Unpublished draft" : "Published"}
          </span>
          {publishedAt && (
            <span className="hidden text-[0.62rem] text-[#8b919d] sm:block">
              Last published {publishedAt}
              {publishedBy ? ` by ${publishedBy}` : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {previewAction && (
            <form action={previewAction}>
              <input type="hidden" name="enabled" value="1" />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-[0.68rem] font-semibold text-[#14161a] hover:border-black/25"
              >
                <Eye className="size-3.5" /> Preview
              </button>
            </form>
          )}
          {hasDraft && (
            <form action={discardAction}>
              <input type="hidden" name="scope" value={scope} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-[0.68rem] font-semibold text-[#6b7280] hover:border-red-300 hover:text-red-600"
              >
                <Undo2 className="size-3.5" /> Discard
              </button>
            </form>
          )}
          <button
            type="button"
            disabled={!canPublish || !hasDraft || disabled}
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d1f3c] px-3 py-1.5 text-[0.68rem] font-semibold text-white hover:bg-[#1b3358] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="size-3.5" /> Publish
          </button>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[0.95rem] font-semibold text-[#14161a]">Publish changes?</h3>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-[#6b7280]">
                  These changes will go live on the website immediately. A version snapshot is saved so you can roll back.
                </p>
              </div>
              <button type="button" onClick={() => setConfirming(false)} aria-label="Close" className="grid size-7 place-items-center rounded-full hover:bg-black/5">
                <X className="size-4" />
              </button>
            </div>
            <form
              action={async (formData) => {
                setPending(true);
                try {
                  await publishAction(formData);
                } catch {
                  toast.error("Publish failed. Please try again.");
                  setPending(false);
                }
              }}
              className="mt-4"
            >
              <input type="hidden" name="scope" value={scope} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <label className="block">
                <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                  Version note (optional)
                </span>
                <input
                  name="note"
                  placeholder="e.g. Diwali hero update"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-[0.78rem] outline-none focus:border-[#0d1f3c]"
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className="rounded-lg border border-black/12 px-3 py-2 text-[0.72rem] font-semibold hover:border-black/25"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d1f3c] px-3 py-2 text-[0.72rem] font-semibold text-white hover:bg-[#1b3358] disabled:opacity-60"
                >
                  {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  Publish now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
