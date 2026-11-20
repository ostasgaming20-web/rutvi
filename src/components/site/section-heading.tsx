import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
      data-reveal
    >
      <span className={cn("eyebrow", align === "center" && "justify-center")}>{eyebrow}</span>
      <h2
        className={cn(
          "display mt-4 text-[clamp(2.2rem,4.4vw,3.6rem)]",
          light ? "text-ivory" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-[0.95rem] leading-relaxed",
            light ? "text-ivory/60" : "text-ink/58",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
