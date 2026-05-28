"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/source-badge";

export interface ExplorerRow {
  id: string;
  type: string;
  name: string;
  country: string;
  countryCode: string;
  location: string;
  coordinates: string;
  rating: string;
  operator: string;
  status: string;
  source: string;
  notes: string;
}

export function DetailDrawer({
  row,
  onClose
}: {
  row: ExplorerRow | null;
  onClose: () => void;
}) {
  if (!row) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-sm" onClick={onClose} aria-label="Close drawer" />
      <aside className="glass-panel atlas-scrollbar absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-slate-700/70 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">{row.type}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-50">{row.name}</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4">
          <SourceBadge mode="sample" />
        </div>
        <dl className="mt-6 grid gap-4 text-sm">
          <Detail label="Location" value={`${row.location}, ${row.country}`} />
          <Detail label="Coordinates" value={row.coordinates} />
          <Detail label="Capacity / rating" value={row.rating} />
          <Detail label="Operator" value={row.operator} />
          <Detail label="Status" value={row.status} />
          <Detail label="Source" value={row.source} />
        </dl>
        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/45 p-4">
          <h3 className="text-sm font-semibold text-slate-100">Notes</h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">{row.notes}</p>
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-800 pb-3">
      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-100">{value}</dd>
    </div>
  );
}
