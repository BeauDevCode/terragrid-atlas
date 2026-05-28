import { SourceBadge } from "@/components/source-badge";
import type { DataFreshness } from "@/lib/data";

export function TooltipCard({
  title,
  rows,
  mode = "sample"
}: {
  title: string;
  rows: Array<{ label: string; value: string }>;
  mode?: DataFreshness;
}) {
  return (
    <div className="min-w-56 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
        <SourceBadge mode={mode} />
      </div>
      <dl className="grid gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-xs">
            <dt className="text-slate-400">{row.label}</dt>
            <dd className="text-right font-medium text-slate-100">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
