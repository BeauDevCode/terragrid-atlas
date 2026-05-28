import { BarChart3, Factory, Server, Zap } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fuelColors, formatCapacity, getCountryBundle, getInfrastructureCounts, type AtlasDataset } from "@/lib/data";

export function CountryStatsCard({
  dataset,
  countryCode
}: {
  dataset: AtlasDataset;
  countryCode: string;
}) {
  const bundle = getCountryBundle(dataset, countryCode);
  const stat = bundle.stat;
  const metadata = bundle.metadata;
  const counts = getInfrastructureCounts(dataset, countryCode);

  if (!metadata || !stat) {
    return null;
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Installed capacity" value={formatCapacity(stat.installedCapacityMW)} icon={<Zap className="h-4 w-4" />} />
        <MetricCard label="Peak demand" value={`${stat.demandPeakGW} GW`} icon={<BarChart3 className="h-4 w-4" />} tone="green" />
        <MetricCard label="Power plants" value={String(bundle.powerPlants.length)} icon={<Factory className="h-4 w-4" />} tone="amber" />
        <MetricCard label="Data centers" value={String(bundle.dataCenters.length)} icon={<Server className="h-4 w-4" />} tone="purple" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Infrastructure counts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {counts.map((count) => (
            <div key={count.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-300">{count.name}</span>
                <span className="font-medium text-slate-50">{count.value}</span>
              </div>
              <Progress value={(count.value / Math.max(...counts.map((item) => item.value), 1)) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top fuel types</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {[...stat.generationMix].sort((a, b) => b.capacityMW - a.capacityMW).slice(0, 5).map((fuel) => (
            <div key={fuel.fuelType} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/45 p-3">
              <span className="flex items-center gap-2 text-sm capitalize text-slate-200">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fuelColors[fuel.fuelType] }} />
                {fuel.fuelType}
              </span>
              <span className="text-sm font-medium text-slate-50">{formatCapacity(fuel.capacityMW)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key facts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Fact label="Grid operator" value={metadata.gridOperator} />
          <Fact label="Electrification rate" value={`${stat.electrificationRate}%`} />
          <Fact label="Renewable share" value={`${stat.renewableShare}%`} />
          <Fact label="Carbon intensity" value={`${stat.gridCarbonIntensityGCO2KWh} gCO2/kWh`} />
          <Fact label="Transmission sample length" value={`${bundle.transmissionLines.reduce((sum, line) => sum + line.lengthKm, 0).toLocaleString()} km`} />
          <Fact label="Primary voltage markers" value={`${Math.max(...bundle.substations.map((item) => item.voltageKV), 0)} kV max`} />
        </CardContent>
      </Card>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="max-w-[62%] text-right font-medium text-slate-100">{value}</span>
    </div>
  );
}
