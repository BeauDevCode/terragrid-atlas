import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CircleDollarSign, Factory, ShieldAlert, Users } from "lucide-react";
import { AlertBanner } from "@/components/alert-banner";
import { AppShell } from "@/components/app-shell";
import { GenerationMixChart, LoadTimeSeriesChart } from "@/components/charts/generation-mix-chart";
import { CountryMapPreview } from "@/components/dashboard/country-map-preview";
import { CountryStatsCard } from "@/components/dashboard/country-stats-card";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCapacity,
  getAtlasDataset,
  getCountryBundle,
  getInfrastructureCounts,
  getOperatorsSummary
} from "@/lib/data";

export const metadata = {
  title: "Region Dashboard"
};

export function generateStaticParams() {
  const dataset = getAtlasDataset();
  return dataset.countries.map((country) => ({ country: country.iso2 }));
}

export default async function CountryDashboardPage({
  params
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const countryCode = country.toUpperCase();
  const dataset = getAtlasDataset();
  const bundle = getCountryBundle(dataset, countryCode);

  if (!bundle.metadata || !bundle.stat) {
    notFound();
  }

  const { metadata, stat } = bundle;
  const loadMetric = bundle.liveMetrics.find((metric) => metric.metric === "load");
  const infrastructureCounts = getInfrastructureCounts(dataset, countryCode);
  const operators = getOperatorsSummary([
    ...bundle.powerPlants,
    ...bundle.substations,
    ...bundle.dataCenters,
    ...bundle.transmissionLines
  ]);
  const topFacilities = [...bundle.powerPlants].sort((a, b) => b.capacityMW - a.capacityMW).slice(0, 5);
  const activeAlerts = bundle.alerts.filter((alert) => alert.status !== "resolved");

  return (
    <AppShell>
      <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100/70">Region / country dashboard</p>
          <h1 className="mt-3 flex flex-wrap items-center gap-3 text-4xl font-semibold tracking-normal text-slate-50">
            <Image
              alt={`${metadata.name} flag`}
              className="h-8 w-11 rounded-sm border border-slate-700 object-cover"
              height={40}
              src={`https://flagcdn.com/w80/${metadata.iso2.toLowerCase()}.png`}
              unoptimized
              width={80}
            />
            {metadata.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Country-level energy statistics, infrastructure counts, operator context, price signals, recent alerts, and a
            focused map preview for the selected system.
          </p>
        </div>
        <Link
          href="/atlas"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-200"
        >
          Open in Atlas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <CountryStatsCard dataset={dataset} countryCode={countryCode} />

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Generation mix</CardTitle>
          </CardHeader>
          <CardContent>
            <GenerationMixChart data={stat.generationMix} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Installed capacity by fuel</CardTitle>
          </CardHeader>
          <CardContent>
            <GenerationMixChart data={stat.generationMix} variant="bar" />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure type counts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {infrastructureCounts.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/45 p-3">
                <span className="text-sm text-slate-300">{item.name}</span>
                <span className="text-sm font-semibold text-slate-50">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample historical demand</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadTimeSeriesChart data={loadMetric?.history ?? []} unit={loadMetric?.unit ?? "GW"} />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <MetricCard
          label="Annual generation"
          value={`${stat.annualGenerationTWh.toLocaleString()} TWh`}
          helper="Country-level sample statistic"
          icon={<Factory className="h-4 w-4" />}
        />
        <MetricCard
          label="Average price"
          value={`$${stat.averagePriceUsdMWh}/MWh`}
          helper="Sample or estimated market signal"
          icon={<CircleDollarSign className="h-4 w-4" />}
          tone="amber"
        />
        <MetricCard
          label="Electrification"
          value={`${stat.electrificationRate}%`}
          helper={`${metadata.populationMillions}M people in metadata`}
          icon={<Users className="h-4 w-4" />}
          tone="green"
        />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Top facilities</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {topFacilities.map((facility) => (
              <div key={facility.id} className="rounded-md border border-slate-800 bg-slate-950/45 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-100">{facility.name}</p>
                  <span className="text-sm text-cyan-100">{formatCapacity(facility.capacityMW)}</span>
                </div>
                <p className="mt-1 text-xs capitalize text-slate-500">{facility.fuelType} / {facility.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operator summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {operators.map((operator) => (
              <div key={operator.operator} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/45 p-3">
                <span className="text-sm text-slate-300">{operator.operator}</span>
                <span className="text-sm font-semibold text-slate-50">{operator.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Map preview</CardTitle>
          </CardHeader>
          <CardContent>
            <CountryMapPreview dataset={dataset} countryCode={countryCode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent alerts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {activeAlerts.length ? (
              activeAlerts.map((alert) => <AlertBanner key={alert.id} alert={alert} />)
            ) : (
              <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-400">
                No active sample alerts for this country.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-lg border border-slate-800 bg-slate-950/45 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-orange-300/25 bg-orange-400/10 text-orange-200">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Data quality note</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              This dashboard uses transparent demo data and estimated signals. It is designed to show how a production adapter
              could feed a research-friendly infrastructure intelligence product.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
