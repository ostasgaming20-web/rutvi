import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#a07f45]">{eyebrow}</p>
        )}
        <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] text-[#14161a] md:text-[2rem]">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.82rem] leading-relaxed text-[#5c6270]">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  padded = false,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("rounded-xl border border-black/7 bg-white shadow-[0_1px_2px_rgba(16,18,22,0.04)]", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/6 px-4 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-[0.84rem] font-semibold text-[#14161a]">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.7rem] text-[#6b7280]">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padded ? "p-4 md:p-5" : ""}>{children}</div>
    </section>
  );
}

const TONES = {
  neutral: "bg-black/5 text-[#3f4552] border-black/8",
  blue: "bg-[#0d1f3c]/8 text-[#0d1f3c] border-[#0d1f3c]/15",
  gold: "bg-[#c3a068]/15 text-[#7a5c28] border-[#c3a068]/30",
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
} as const;

export type Tone = keyof typeof TONES;

export function Tag({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6rem] font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  href,
  trend,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  note?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  trend?: string;
  tone?: "blue" | "gold" | "green" | "neutral";
}) {
  const iconTone = {
    blue: "bg-[#0d1f3c]/8 text-[#0d1f3c]",
    gold: "bg-[#c3a068]/15 text-[#8a6a33]",
    green: "bg-emerald-50 text-emerald-700",
    neutral: "bg-black/5 text-[#3f4552]",
  }[tone];

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        {Icon ? (
          <span className={cn("grid size-8 place-items-center rounded-lg", iconTone)}>
            <Icon className="size-4" />
          </span>
        ) : (
          <span />
        )}
        {href && <ArrowUpRight className="size-3.5 text-black/20 transition-colors group-hover:text-[#0d1f3c]" />}
      </div>
      <p className="mt-3 text-[1.55rem] font-semibold leading-none tracking-[-0.02em] text-[#14161a]">{value}</p>
      <p className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[#7b8290]">{label}</p>
      {(note || trend) && (
        <p className="mt-1.5 truncate text-[0.65rem] text-[#8b919d]">
          {trend && <span className="font-medium text-emerald-700">{trend} </span>}
          {note}
        </p>
      )}
    </>
  );

  const className =
    "group block rounded-xl border border-black/7 bg-white p-3.5 shadow-[0_1px_2px_rgba(16,18,22,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(16,18,22,0.4)]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-black/4 text-[#8b919d]">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-[0.85rem] font-medium text-[#14161a]">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[0.72rem] leading-relaxed text-[#7b8290]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required,
  hint,
  className,
  step,
  min,
  max,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  step?: string;
  min?: string | number;
  max?: string | number;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        step={step}
        min={min}
        max={max}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem] text-[#14161a] outline-none transition-shadow placeholder:text-black/30 focus:border-[#0d1f3c] focus:ring-2 focus:ring-[#0d1f3c]/10"
      />
      {hint && <span className="mt-1 block text-[0.62rem] text-[#8b919d]">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 3,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem] leading-relaxed text-[#14161a] outline-none transition-shadow placeholder:text-black/30 focus:border-[#0d1f3c] focus:ring-2 focus:ring-[#0d1f3c]/10"
      />
      {hint && <span className="mt-1 block text-[0.62rem] text-[#8b919d]">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  hint,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  options: { value: string | number; label: string }[];
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[0.8rem] text-[#14161a] outline-none focus:border-[#0d1f3c] focus:ring-2 focus:ring-[#0d1f3c]/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-[0.62rem] text-[#8b919d]">{hint}</span>}
    </label>
  );
}

export function Toggle({
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
    <label className="flex items-start gap-2.5 rounded-lg border border-black/8 bg-white px-3 py-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 rounded border-black/20 accent-[#0d1f3c]"
      />
      <span className="min-w-0">
        <span className="block text-[0.75rem] font-medium text-[#14161a]">{label}</span>
        {hint && <span className="block text-[0.62rem] text-[#8b919d]">{hint}</span>}
      </span>
    </label>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  target,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "gold";
  className?: string;
  target?: string;
}) {
  const styles = {
    primary: "bg-[#0d1f3c] text-white hover:bg-[#1b3358]",
    ghost: "border border-black/12 bg-white text-[#14161a] hover:border-black/25",
    gold: "bg-[#c3a068] text-[#14161a] hover:bg-[#d3b47f]",
  }[variant];
  return (
    <Link
      href={href}
      target={target}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[0.7rem] font-semibold transition-colors",
        styles,
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn("whitespace-nowrap border-b border-black/6 px-3 py-2.5 text-left text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[#7b8290]", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-black/5 px-3 py-2.5 text-[0.74rem] text-[#3f4552]", className)}>{children}</td>;
}

export function Meter({ value, tone = "blue" }: { value: number; tone?: "blue" | "gold" | "green" }) {
  const color = { blue: "bg-[#0d1f3c]", gold: "bg-[#c3a068]", green: "bg-emerald-500" }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/8">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
