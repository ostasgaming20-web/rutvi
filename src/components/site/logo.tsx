import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "dark",
  compact = false,
}: {
  className?: string;
  variant?: "dark" | "light";
  compact?: boolean;
}) {
  const ink = variant === "light" ? "#f8f5ef" : "#14130f";
  const sub = variant === "light" ? "rgba(248,245,239,0.62)" : "rgba(20,19,15,0.55)";

  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label="RUTVI ENTERPRISE home">
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M20 2.5 37.5 20 20 37.5 2.5 20 20 2.5Z" stroke="#c3a068" strokeWidth="1" />
        <path d="M20 8.5 31.5 20 20 31.5 8.5 20 20 8.5Z" stroke="#c3a068" strokeWidth="0.6" opacity="0.55" />
        <path d="M20 12.5v15M12.5 20h15" stroke={ink} strokeWidth="1" opacity="0.9" />
        <path d="M20 16.2c2.1-3.2 6-1.2 4.1 1.9-1 1.7-4.1 3.4-4.1 3.4s-3.1-1.7-4.1-3.4c-1.9-3.1 2-5.1 4.1-1.9Z" fill={ink} />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className="text-[1.02rem] font-semibold tracking-[0.26em]"
            style={{ color: ink }}
          >
            RUTVI
          </span>
          <span
            className="mt-1 text-[0.5rem] font-medium tracking-[0.42em]"
            style={{ color: sub }}
          >
            ENTERPRISE
          </span>
        </span>
      )}
    </Link>
  );
}
