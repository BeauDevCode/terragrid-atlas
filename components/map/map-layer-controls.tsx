"use client";

import { Layers, Waves } from "lucide-react";
import { layerLabels, type AtlasLayerId } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LayerState = Record<AtlasLayerId, boolean>;

export function defaultLayerState(): LayerState {
  return layerLabels.reduce((acc, layer) => {
    acc[layer.id] = true;
    return acc;
  }, {} as LayerState);
}

export function MapLayerControls({
  layers,
  onToggle,
  densityMode,
  onDensityModeChange
}: {
  layers: LayerState;
  onToggle: (layer: AtlasLayerId) => void;
  densityMode: boolean;
  onDensityModeChange: (value: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-cyan-300/15 bg-slate-950/60 p-2.5 shadow-panel">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          <Layers className="h-4 w-4 text-cyan-200" />
          Layer stack
        </div>
        <Button
          type="button"
          size="sm"
          variant={densityMode ? "primary" : "secondary"}
          onClick={() => onDensityModeChange(!densityMode)}
          title="Toggle density mode"
        >
          <Waves className="h-4 w-4" />
          Density
        </Button>
      </div>
      <p className="mb-2 text-[10px] leading-4 text-slate-500">
        {densityMode ? "Demo density layer active: visual sample infrastructure markers." : "Density layer hidden; verified sample records remain visible."}
      </p>
      <div className="grid gap-1.5">
        {layerLabels.map((layer) => (
          <label
            key={layer.id}
            className={cn(
              "group flex cursor-pointer items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs transition",
              layers[layer.id]
                ? "border-cyan-300/35 bg-cyan-300/[0.09] text-slate-50 shadow-[0_0_18px_rgba(34,211,238,0.08)]"
                : "border-slate-800 bg-slate-950/50 text-slate-500 hover:border-slate-600 hover:text-slate-300"
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn("h-2.5 w-2.5 shrink-0 rounded-full", layers[layer.id] && "shadow-[0_0_12px_currentColor]")}
                style={{ backgroundColor: layer.color, color: layer.color }}
              />
              <span className="truncate">{layer.label}</span>
            </span>
            <input
              checked={layers[layer.id]}
              className="h-3.5 w-3.5 accent-cyan-300"
              type="checkbox"
              onChange={() => onToggle(layer.id)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
