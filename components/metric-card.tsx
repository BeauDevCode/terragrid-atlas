import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = "cyan",
  compact = false
}: {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  tone?: "cyan" | "green" | "amber" | "purple" | "red";
  compact?: boolean;
}) {
  const toneClasses = {
    cyan: "text-cyan-200 bg-cyan-300/10 border-cyan-300/20",
    green: "text-emerald-200 bg-emerald-300/10 border-emerald-300/20",
    amber: "text-amber-200 bg-amber-300/10 border-amber-300/20",
    purple: "text-violet-200 bg-violet-300/10 border-violet-300/20",
    red: "text-orange-200 bg-orange-400/10 border-orange-300/20"
  };

  return (
    <Card className={cn("overflow-hidden p-4", compact && "p-3")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className={cn("mt-2 font-semibold text-slate-50", compact ? "text-lg" : "text-2xl")}>{value}</p>
        </div>
        <span className={cn("rounded-md border p-2", toneClasses[tone])}>
          {icon ?? <ArrowUpRight className="h-4 w-4" />}
        </span>
      </div>
      {helper ? <p className="mt-3 line-clamp-2 text-xs text-slate-400">{helper}</p> : null}
    </Card>
  );
}
