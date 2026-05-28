"use client";

import { Building2, Factory, Gauge, Globe2, Server, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { CompareChart } from "@/components/charts/compare-chart";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCapacity,
  getCountryMetrics,
  type AggregatedCountryMetrics,
  type AtlasDataset
} from "@/lib/data";
import { cn } from "@/lib/utils";

const defaultSelection = ["US", "DE", "IN", "CN"];

export function CompareDashboard({ dataset }: { dataset: AtlasDataset }) {
  const [selected, setSelected] = useState(defaultSelection);

  const metrics = useMemo(
    () =>
      selected
        .map((countryCode) => getCountryMetrics(dataset, countryCode))
        .filter(Boolean) as AggregatedCountryMetrics[],
    [dataset, selected]
  );

  const chartData = metrics.map((metric) => ({
    country: metric.country,
    capacityGW: Math.round(metric.installedCapacityMW / 1000),
    plants: metric.powerPlantCount,
    dataCenters: metric.dataCenterCount,
    price: Math.round(metric.averagePriceUsdMWh),
    density: Number(metric.infrastructureDensity.toFixed(2))
  }));

  const toggleCountry = (countryCode: string) => {
    setSelected((current) => {
      if (current.includes(countryCode)) {
        return current.length > 2 ? current.filter((item) => item !== countryCode) : current;
      }
      return current.length < 4 ? [...current, countryCode] : [current[1], current[2], current[3], countryCode];
    });
  };

  return (
    <div className="grid gap-6">
      <div className="glass-panel rounded-lg p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Globe2 className="h-4 w-4 text-cyan-200" />
          Select 2-4 countries
        </div>
        <div className="flex flex-wrap gap-2">
          {dataset.countries.map((country) => (
            <button
              key={country.iso2}
              onClick={() => toggleCountry(country.iso2)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm transition",
                selected.includes(country.iso2)
                  ? "border-cyan-300/45 bg-cyan-300/12 text-cyan-50"
                  : "border-slate-700 bg-slate-950/55 text-slate-400 hover:border-slate-500 hover:text-slate-100"
              )}
            >
              <span className="mr-2">{country.flag}</span>
              {country.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Largest selected system"
          value={formatCapacity(Math.max(...metrics.map((item) => item.installedCapacityMW)))}
          helper="Installed generation capacity"
          icon={<Zap className="h-4 w-4" />}
        />
        <MetricCard
          label="Combined plant records"
          value={String(metrics.reduce((sum, item) => sum + item.powerPlantCount, 0))}
          helper="Sample facilities in selection"
          icon={<Factory className="h-4 w-4" />}
          tone="green"
        />
        <MetricCard
          label="Data center records"
          value={String(metrics.reduce((sum, item) => sum + item.dataCenterCount, 0))}
          helper="Estimated compute layer"
          icon={<Server className="h-4 w-4" />}
          tone="purple"
        />
        <MetricCard
          label="Avg price signal"
          value={`$${Math.round(metrics.reduce((sum, item) => sum + item.averagePriceUsdMWh, 0) / metrics.length)}/MWh`}
          helper="Sample or estimated"
          icon={<Gauge className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Capacity, plants, and data centers</CardTitle>
          </CardHeader>
          <CardContent>
            <CompareChart
              data={chartData}
              bars={[
                { key: "capacityGW", label: "Capacity GW", color: "#22d3ee" },
                { key: "plants", label: "Plant records", color: "#34d399" },
                { key: "dataCenters", label: "Data centers", color: "#a78bfa" }
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Price and infrastructure density</CardTitle>
          </CardHeader>
          <CardContent>
            <CompareChart
              data={chartData}
              bars={[
                { key: "price", label: "USD/MWh", color: "#facc15" },
                { key: "density", label: "Density score", color: "#60a5fa" }
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selected country comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="atlas-scrollbar overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Country</th>
                  <th className="px-3 py-2 text-left">Capacity</th>
                  <th className="px-3 py-2 text-left">Plants</th>
                  <th className="px-3 py-2 text-left">Substations</th>
                  <th className="px-3 py-2 text-left">Transmission</th>
                  <th className="px-3 py-2 text-left">Data centers</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Density</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.countryCode} className="border-t border-slate-800">
                    <td className="px-3 py-3 font-medium text-slate-100">{metric.country}</td>
                    <td className="px-3 py-3 text-slate-300">{formatCapacity(metric.installedCapacityMW)}</td>
                    <td className="px-3 py-3 text-slate-300">{metric.powerPlantCount}</td>
                    <td className="px-3 py-3 text-slate-300">{metric.substationCount}</td>
                    <td className="px-3 py-3 text-slate-300">{metric.transmissionLengthKm.toLocaleString()} km</td>
                    <td className="px-3 py-3 text-slate-300">{metric.dataCenterCount}</td>
                    <td className="px-3 py-3 text-slate-300">${metric.averagePriceUsdMWh}/MWh</td>
                    <td className="px-3 py-3 text-slate-300">{metric.infrastructureDensity.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => setSelected(defaultSelection)}>
          <Building2 className="h-4 w-4" />
          Reset comparison
        </Button>
      </div>
    </div>
  );
}
