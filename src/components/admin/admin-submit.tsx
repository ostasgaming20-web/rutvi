"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-[#0d1f3c] text-white hover:bg-[#1b3358]",
  gold: "bg-[#c3a068] text-[#14161a] hover:bg-[#d3b47f]",
  ghost: "border border-black/12 bg-white text-[#14161a] hover:border-black/25",
  danger: "bg-red-600 text-white hover:bg-red-700",
  subtle: "bg-black/5 text-[#14161a] hover:bg-black/10",
} as const;

export function AdminSubmit({
  children,
  variant = "primary",
  className,
  pendingLabel,
  size = "md",
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  pendingLabel?: string;
  size?: "sm" | "md";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:opacity-60",
        size === "sm" ? "px-2.5 py-1.5 text-[0.65rem]" : "px-3.5 py-2 text-[0.72rem]",
        variants[variant],
        className,
      )}
    >
      {pending ? (
        <>
          <Loader2 className="size-3.5 animate-spin" /> {pendingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
