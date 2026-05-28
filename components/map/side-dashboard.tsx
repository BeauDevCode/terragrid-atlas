"use client";

import { ChevronLeft, ChevronRight, CircleGauge, Database, Factory, Server, TowerControl, Zap } from "lucide-react";
import { useState } from "react";
import { AlertBanner } from "@/components/alert-banner";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  formatCapacity,
  formatCompactNumber,
  getActiveAlerts,
  getCountryBundle,
  getWorldOverview,
  type AtlasDataset
} from "@/lib/data";
import { cn } from "@/lib/utils";

export function SideDashboard({
  dataset,
  selectedCountryCode
}: {
  dataset: AtlasDataset;
  selectedCountryCode?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const overview = getWorldOverview(dataset);
  const bundle = selectedCountryCode ? getCountryBundle(dataset, selectedCountryCode) : undefined;
  const stat = bundle?.stat;
  const scopeName = bundle?.metadata?.name ?? "World";
  const alerts = selectedCountryCode ? (bundle?.alerts ?? []) : getActiveAlerts(dataset.alerts);
  const activeAlerts = alerts.filter((alert) => alert.status !== "resolved");
  const generationMix = stat?.generationMix ?? [];

  return (
    <aside
      className={cn(
        "glass-panel atlas-scrollbar pointer-events-auto max-h-[calc(100vh-96px)] overflow-y-auto rounded-lg transition-all",
        collapsed ? "w-[64px] p-2" : "w-[360px] p-4"
      )}
    >
      <div className={cn("flex items-center justify-between gap-3", collapsed && "justify-center")}>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">Current scope</p>
            <h2 className="truncate text-xl font-semibold text-slate-50">{scopeName}</h2>
          </div>
        ) : null}
        <Button size="icon" variant="ghost" onClick={() => setCollapsed(!collapsed)} title="Collapse dashboard">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {collapsed ? null : (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              compact
              label="Installed Capacity"
              value={formatCapacity(stat?.installedCapacityMW ?? overview.installedCapacityMW)}
              helper={selectedCountryCode ? "Country total" : "Global sample total"}
              icon={<Zap className="h-4 w-4" />}
            />
            <MetricCard
              compact
              label="Plants"
              value={formatCompactNumber(bundle?.powerPlants.length ?? overview.powerPlantCount, 1)}
              helper="Mapped facilities"
              icon={<Factory className="h-4 w-4" />}
              tone="green"
            />
            <MetricCard
              compact
              label="Substations"
              value={formatCompactNumber(bundle?.substations.length ?? overview.substationCount, 1)}
              helper="High-voltage nodes"
              icon={<TowerControl className="h-4 w-4" />}
              tone="purple"
            />
            <MetricCard
              compact
              label="Data Centers"
              value={formatCompactNumber(bundle?.dataCenters.length ?? overview.dataCenterCount, 1)}
              helper="Mapped compute load"
              icon={<Server className="h-4 w-4" />}
              tone="amber"
            />
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Generation mix summary</h3>
              <span className="text-xs text-slate-500">{stat?.dataMode ?? "sample"}</span>
            </div>
            <div className="space-y-3">
              {(generationMix.length ? generationMix : [{ fuelType: "mixed" as const, share: 100, capacityMW: overview.installedCapacityMW }])
                .slice(0, 6)
                .map((fuel) => (
                  <div key={fuel.fuelType}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="capitalize text-slate-300">{fuel.fuelType}</span>
                      <span className="text-slate-400">{fuel.share}%</span>
                    </div>
                    <Progress value={fuel.share} indicatorClassName="bg-cyan-300" />
                  </div>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Price signal</p>
              <p className="mt-2 text-xl font-semibold text-slate-50">
                ${Math.round(stat?.averagePriceUsdMWh ?? overview.averagePriceUsdMWh)}
                <span className="ml-1 text-xs font-normal text-slate-400">/MWh</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Active alerts</p>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-slate-50">
                <CircleGauge className="h-4 w-4 text-orange-200" />
                {activeAlerts.length}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Selected statistics</h3>
              <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400">Demo</span>
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Peak demand</dt>
                <dd className="font-medium text-slate-100">{stat ? `${stat.demandPeakGW} GW` : "Global aggregate"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Renewable share</dt>
                <dd className="font-medium text-slate-100">{stat ? `${stat.renewableShare}%` : "Mixed"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Carbon intensity</dt>
                <dd className="font-medium text-slate-100">{stat ? `${stat.gridCarbonIntensityGCO2KWh} gCO2/kWh` : "Varies"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Last update</dt>
                <dd className="font-medium text-slate-100">{stat?.updatedAt ?? "2026-05-01"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-200" />
              <h3 className="text-sm font-semibold text-slate-100">Data freshness</h3>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              Live adapters are structured for regional public sources, while this MVP runs on transparent sample and estimated
              records so the atlas remains deployable without paid services.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">Recent alerts</h3>
            {activeAlerts.slice(0, 3).map((alert) => (
              <AlertBanner key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
