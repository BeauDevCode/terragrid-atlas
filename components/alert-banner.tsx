import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GridAlert } from "@/lib/data";

export function AlertBanner({ alert }: { alert: GridAlert }) {
  const severityClass =
    alert.severity === "high"
      ? "border-orange-300/35 bg-orange-500/12 text-orange-50"
      : alert.severity === "medium"
        ? "border-amber-300/30 bg-amber-500/10 text-amber-50"
        : "border-cyan-300/25 bg-cyan-300/10 text-cyan-50";

  return (
    <div className={cn("rounded-lg border p-3", severityClass)}>
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{alert.title}</p>
          <p className="mt-1 text-xs leading-5 opacity-80">{alert.description}</p>
        </div>
      </div>
    </div>
  );
}
