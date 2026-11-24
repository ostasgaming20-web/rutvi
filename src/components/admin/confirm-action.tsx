"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export function ConfirmAction({
  action,
  fields = {},
  message,
  confirmLabel = "Confirm",
  children,
  className,
  title = "Please confirm",
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields?: Record<string, string | number | boolean>;
  message: string;
  confirmLabel?: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <>
      <form
        ref={formRef}
        action={async (formData) => {
          setPending(true);
          try {
            await action(formData);
          } finally {
            setPending(false);
            setOpen(false);
          }
        }}
      >
        {Object.entries(fields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={className}
        >
          {children}
        </button>
      </form>

      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <h3 className="text-[0.9rem] font-semibold text-[#14161a]">{title}</h3>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-[#6b7280]">{message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-lg border border-black/12 px-3 py-2 text-[0.72rem] font-semibold text-[#14161a] hover:border-black/25"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => formRef.current?.requestSubmit()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-[0.72rem] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pending && <Loader2 className="size-3.5 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
