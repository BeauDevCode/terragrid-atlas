import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "cyan" | "green" | "amber" | "red" | "slate" | "purple";

const variants: Record<BadgeVariant, string> = {
  cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  green: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  amber: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  red: "border-orange-300/30 bg-orange-400/10 text-orange-100",
  slate: "border-slate-500/40 bg-slate-800/70 text-slate-200",
  purple: "border-violet-300/25 bg-violet-300/10 text-violet-100"
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
