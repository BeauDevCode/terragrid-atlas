import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function EmptyState({
  title = "No records found",
  description,
  icon
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700/80 bg-slate-950/35 p-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-300">
        {icon ?? <SearchX className="h-5 w-5" />}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-100">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}
