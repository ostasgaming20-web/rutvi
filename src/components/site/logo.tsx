import Link from "next/link";
import Image from "next/image";
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
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="RUTVI ENTERPRISE home">
      <Image
        src="/brand/rutvi-mark.png"
        alt="RUTVI ENTERPRISE"
        width={256}
        height={256}
        priority
        sizes="64px"
        className={cn(
          "shrink-0 object-contain transition-transform duration-500 group-hover:scale-[1.04]",
          compact ? "size-9" : "size-11",
        )}
      />
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
