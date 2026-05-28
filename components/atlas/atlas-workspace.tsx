"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CircleDollarSign,
  Database,
  Gauge,
  GitCompare,
  Globe2,
  Layers3,
  Map,
  RadioTower,
  Search,
  Server,
  ShieldCheck,
  Zap
} from "lucide-react";
import { FilterPanel } from "@/components/map/filter-panel";
import { defaultLayerState, MapLayerControls, type LayerState } from "@/components/map/map-layer-controls";
import { SearchBar } from "@/components/map/search-bar";
import { WorldMap } from "@/components/map/world-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  fuelColors,
  formatCapacity,
  getActiveAlerts,
  getCountryBundle,
  getWorldOverview,
  type AtlasDataset,
  type AtlasFilters,
  type AtlasLayerId,
  type GenerationMix
} from "@/lib/data";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: Globe2 },
  { href: "/atlas", label: "Global atlas", icon: Map },
  { href: "/dashboard/US", label: "Region dashboard", icon: BarChart3 },
  { href: "/explorer", label: "Infrastructure", icon: Database },
  { href: "/compare", label: "Compare", icon: GitCompare }
];

export function AtlasWorkspace({ dataset }: { dataset: AtlasDataset }) {
  const [layers, setLayers] = useState<LayerState>(() => defaultLayerState());
  const [filters, setFilters] = useState<AtlasFilters>({ dataMode: "all", infrastructureType: "all", status: "all" });
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | undefined>();
  const [densityMode, setDensityMode] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const overview = useMemo(() => getWorldOverview(dataset), [dataset]);

  const selectedBundle = selectedCountryCode ? getCountryBundle(dataset, selectedCountryCode) : undefined;
  const selectedCountry = selectedBundle?.metadata;
  const selectedStat = selectedBundle?.stat;
  const scopeName = selectedCountry?.name ?? "Global grid scope";
  const activeAlerts = selectedCountryCode
    ? (selectedBundle?.alerts ?? []).filter((alert) => alert.status !== "resolved")
    : getActiveAlerts(dataset.alerts);

  const generationMix = useMemo(() => {
    if (selectedStat) {
      return selectedStat.generationMix;
    }

    const totals = dataset.countryEnergyStats.reduce<Record<string, number>>((acc, stat) => {
      stat.generationMix.forEach((fuel) => {
        acc[fuel.fuelType] = (acc[fuel.fuelType] ?? 0) + fuel.capacityMW;
      });
      return acc;
    }, {});
    const total = Object.values(totals).reduce((sum, value) => sum + value, 0);

    return Object.entries(totals)
      .map(([fuelType, capacityMW]) => ({
        fuelType: fuelType as GenerationMix["fuelType"],
        capacityMW,
        share: total ? Math.round((capacityMW / total) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.capacityMW - a.capacityMW)
      .slice(0, 6);
  }, [dataset.countryEnergyStats, selectedStat]);

  const handleLayerToggle = useCallback((layer: AtlasLayerId) => {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }, []);

  const handleFiltersChange = useCallback((nextFilters: AtlasFilters) => {
    setFilters(nextFilters);
    setSelectedCountryCode(nextFilters.countryCode);
  }, []);

  const handleSelectCountry = useCallback((countryCode: string) => {
    setSelectedCountryCode(countryCode);
    setFilters((current) => ({ ...current, countryCode }));
  }, []);

  const clearScope = () => {
    setSelectedCountryCode(undefined);
    setFilters((current) => ({ ...current, countryCode: undefined }));
  };

  const timestamp = formatTimestamp(dataset.liveMetrics[0]?.updatedAt ?? "2026-05-01T15:00:00Z");

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#03080d] text-slate-100 lg:h-screen lg:overflow-hidden">
      <div className="absolute inset-0 bg-atlas-grid atlas-grid opacity-[0.045]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_20%,rgba(34,211,238,0.08),transparent_26%),radial-gradient(circle_at_82%_70%,rgba(16,185,129,0.05),transparent_24%)]" />

      <div className="relative z-10 grid min-h-screen min-w-0 lg:h-full lg:min-h-0 lg:grid-cols-[286px_1fr]">
        <aside className="atlas-scrollbar z-30 flex max-h-[58vh] min-h-0 min-w-0 flex-col overflow-y-auto border-r border-cyan-300/14 bg-[#020617]/88 shadow-[16px_0_64px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:max-h-none">
          <div className="border-b border-slate-800/85 p-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-200 shadow-glow">
                <Globe2 className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold tracking-wide text-slate-50">TerraGrid Atlas</span>
                <span className="block text-xs text-cyan-100/70">Global Grid Intelligence</span>
              </span>
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <LivePill label="System" value="Live-ready" tone="green" />
              <LivePill label="Mode" value="Demo data" tone="cyan" />
            </div>
          </div>

          <nav className="grid gap-1 border-b border-slate-800/90 p-2.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-xs transition",
                  item.href === "/atlas"
                    ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
                    : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="atlas-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.065] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/60">Current scope</p>
                  <h2 className="mt-1 truncate text-base font-semibold text-slate-50">{scopeName}</h2>
                </div>
                <ShieldCheck className="h-4 w-4 text-emerald-200" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <SidebarMetric label="Capacity" value={formatCapacity(selectedStat?.installedCapacityMW ?? overview.installedCapacityMW)} />
                <SidebarMetric label="Plants" value={String(selectedBundle?.powerPlants.length ?? overview.powerPlantCount)} />
                <SidebarMetric label="Substations" value={String(selectedBundle?.substations.length ?? overview.substationCount)} />
                <SidebarMetric label="Data centers" value={String(selectedBundle?.dataCenters.length ?? overview.dataCenterCount)} />
              </div>
            </div>

            <div className="rounded-lg border border-slate-700/70 bg-slate-950/55 p-2.5">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <Search className="h-3.5 w-3.5 text-cyan-200" />
                Global search
              </div>
              <SearchBar
                value={filters.query ?? ""}
                onChange={(query) => setFilters((current) => ({ ...current, query }))}
                placeholder="Plant, country, operator..."
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button size="sm" variant="secondary" onClick={clearScope}>
                  Global
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleSelectCountry("US")}>
                  Demo region
                </Button>
              </div>
            </div>

            <MapLayerControls
              layers={layers}
              onToggle={handleLayerToggle}
              densityMode={densityMode}
              onDensityModeChange={setDensityMode}
            />

            <div className="rounded-lg border border-slate-700/70 bg-slate-950/55">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-100"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                Advanced filters
                <span className="text-xs text-cyan-100">{filtersOpen ? "Hide" : "Open"}</span>
              </button>
              {filtersOpen ? (
                <div className="border-t border-slate-800 p-3">
                  <FilterPanel dataset={dataset} filters={filters} onChange={handleFiltersChange} />
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-amber-300/15 bg-amber-300/[0.055] px-3 py-2 text-[11px] leading-4 text-slate-400">
              <span className="font-medium uppercase tracking-[0.14em] text-amber-100/70">Sample density</span>
              <p className="mt-1">Additional visual demo points show plausible global infrastructure density; records are not verified live assets.</p>
            </div>
          </div>
        </aside>

        <section className="relative min-h-[1120px] min-w-0 overflow-hidden lg:min-h-0">
          <WorldMap
            dataset={dataset}
            filters={filters}
            layers={layers}
            densityMode={densityMode}
            selectedCountryCode={selectedCountryCode}
            onSelectCountry={handleSelectCountry}
            showAttributionNote={false}
          />

          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-col gap-2 xl:inset-x-4 xl:top-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="pointer-events-auto rounded-lg border border-cyan-300/16 bg-[#020617]/72 px-3 py-2 shadow-panel backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="cyan">Global Atlas</Badge>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Operations / World grid map</span>
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.13em] text-amber-100">
                  Sample density
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="break-words text-base font-semibold tracking-normal text-slate-50 sm:text-lg">Global Infrastructure Intelligence</h1>
                <span className="text-xs text-emerald-200">Updated {timestamp}</span>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-950/35 px-3 py-2 backdrop-blur-xl">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-100">Monitoring {dataset.countries.length} countries</span>
            </div>
          </div>

          <div className="pointer-events-none absolute left-3 right-3 top-[112px] z-20 max-w-none lg:left-4 lg:right-auto lg:top-[94px] lg:w-[306px] lg:max-w-[calc(100vw-40px)]">
            <GenerationMixPanel data={generationMix} />
          </div>

          <div className="pointer-events-none absolute left-3 right-3 top-[348px] z-20 max-w-none lg:left-auto lg:right-4 lg:top-[94px] lg:w-[316px] lg:max-w-[calc(100vw-40px)]">
            <MarketPanel
              scopeName={scopeName}
              selectedStat={selectedStat}
              overviewPrice={overview.averagePriceUsdMWh}
              alerts={activeAlerts.length}
              regions={dataset.gridRegions.length}
              priceNodes={selectedBundle?.priceNodes.length ?? dataset.priceNodes.length}
            />
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 lg:bottom-4 lg:left-4 lg:right-4">
            <div className="grid gap-2 rounded-lg border border-cyan-300/16 bg-[#020617]/76 p-2 shadow-panel backdrop-blur-xl sm:grid-cols-2 xl:grid-cols-5">
              <BottomStat icon={<Gauge className="h-4 w-4" />} label="Aggregate load" value={`${overview.realtimeLoadGW.toLocaleString()} GW`} tone="cyan" />
              <BottomStat icon={<Server className="h-4 w-4" />} label="Data centers" value={String(overview.dataCenterCount)} tone="purple" />
              <BottomStat icon={<Zap className="h-4 w-4" />} label="Total capacity" value={formatCapacity(overview.installedCapacityMW)} tone="green" />
              <BottomStat icon={<RadioTower className="h-4 w-4" />} label="Regions" value={String(dataset.gridRegions.length)} tone="yellow" />
              <BottomStat icon={<AlertTriangle className="h-4 w-4" />} label="Active alerts" value={String(activeAlerts.length)} tone="orange" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LivePill({ label, value, tone }: { label: string; value: string; tone: "green" | "cyan" }) {
  return (
    <div
      className={cn(
        "rounded-md border px-2.5 py-1.5",
        tone === "green"
          ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
          : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-0.5 text-xs font-semibold">{value}</p>
    </div>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-700/70 bg-slate-950/55 p-2.5">
      <p className="truncate text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function GenerationMixPanel({ data }: { data: GenerationMix[] }) {
  return (
    <div className="rounded-lg border border-cyan-300/18 bg-[#020617]/72 p-3 shadow-panel backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/60">Generation mix</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-50">Fuel capacity distribution</h2>
        </div>
        <Layers3 className="h-4 w-4 text-cyan-200" />
      </div>
      <div className="mt-3 space-y-2.5">
        {data.slice(0, 6).map((fuel) => (
          <div key={fuel.fuelType}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 capitalize text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fuelColors[fuel.fuelType] }} />
                {fuel.fuelType}
              </span>
              <span className="font-medium text-slate-100">{fuel.share}%</span>
            </div>
            <Progress value={fuel.share} indicatorClassName="bg-cyan-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketPanel({
  scopeName,
  selectedStat,
  overviewPrice,
  alerts,
  regions,
  priceNodes
}: {
  scopeName: string;
  selectedStat?: { averagePriceUsdMWh: number; demandPeakGW: number; renewableShare: number; gridCarbonIntensityGCO2KWh: number };
  overviewPrice: number;
  alerts: number;
  regions: number;
  priceNodes: number;
}) {
  return (
    <div className="rounded-lg border border-emerald-300/18 bg-[#020617]/72 p-3 shadow-panel backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/60">ISO / region market</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-50">{scopeName}</h2>
        </div>
        <CircleDollarSign className="h-4 w-4 text-emerald-200" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MarketDatum label="Price" value={`$${Math.round(selectedStat?.averagePriceUsdMWh ?? overviewPrice)}/MWh`} />
        <MarketDatum label="Peak load" value={selectedStat ? `${selectedStat.demandPeakGW} GW` : "Global"} />
        <MarketDatum label="Price nodes" value={String(priceNodes)} />
        <MarketDatum label="Regions" value={String(regions)} />
      </div>
      <div className="mt-2 rounded-md border border-yellow-300/20 bg-yellow-300/10 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.16em] text-yellow-100/70">Alert posture</span>
          <span className="text-xs font-semibold text-yellow-100">{alerts} active</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-4 text-slate-400">
          Adapter-ready live feeds; current market values are sample or estimated signals.
        </p>
      </div>
    </div>
  );
}

function MarketDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-700/80 bg-slate-950/60 p-2.5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function BottomStat({
  icon,
  label,
  value,
  tone
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "cyan" | "green" | "purple" | "yellow" | "orange";
}) {
  const tones = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    green: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    purple: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    yellow: "border-yellow-300/25 bg-yellow-300/10 text-yellow-100",
    orange: "border-orange-300/25 bg-orange-300/10 text-orange-100"
  };

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-slate-700/70 bg-slate-950/58 px-2.5 py-2">
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md border", tones[tone])}>{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</span>
        <span className="mt-0.5 block truncate text-base font-semibold text-slate-50">{value}</span>
      </span>
    </div>
  );
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short"
  }).format(new Date(value));
}
