import Link from "next/link";
import { ArrowRight, BookOpen, DatabaseZap, Globe2, Layers3, Network, Server, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HeroSection } from "@/components/hero-section";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCapacity, getAtlasDataset, getWorldOverview } from "@/lib/data";

const layerHighlights = [
  { label: "Power plants", icon: Zap, detail: "Generation assets by fuel, capacity, status, and operator." },
  { label: "Transmission", icon: Network, detail: "Simplified corridors with voltage classes and interconnection markers." },
  { label: "Substations", icon: Layers3, detail: "High-voltage nodes that structure regional transfer paths." },
  { label: "Data centers", icon: Server, detail: "Estimated compute load as a visible grid-demand layer." },
  { label: "Country statistics", icon: DatabaseZap, detail: "Generation mix, price signals, load snapshots, and alert context." }
];

export default function LandingPage() {
  const dataset = getAtlasDataset();
  const overview = getWorldOverview(dataset);

  return (
    <AppShell>
      <HeroSection />

      <section className="py-14">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Installed capacity" value={formatCapacity(overview.installedCapacityMW)} helper="Sample country totals" />
          <MetricCard label="Countries covered" value={String(overview.countriesCovered)} helper="Multi-continent demo dataset" tone="green" />
          <MetricCard label="Infrastructure records" value={String(overview.powerPlantCount + overview.substationCount + overview.dataCenterCount)} helper="Plants, substations, and data centers" tone="purple" />
          <MetricCard label="Active alerts" value={String(overview.activeAlerts)} helper="Demo grid event feed" tone="red" />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100/70">Why I built this</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-50">A serious atlas for fragmented grid data.</h2>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-6">
          <p className="text-lg leading-8 text-slate-300">
            I built TerraGrid Atlas because energy infrastructure data is often fragmented, paywalled, or difficult to
            explore. I wanted to create a global, interactive tool that helps people understand how power systems are
            distributed and connected across the world.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100/70">Atlas layers</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-50">Built around infrastructure, not just charts.</h2>
          </div>
          <Link href="/atlas" className="hidden items-center gap-2 text-sm font-medium text-cyan-100 hover:text-cyan-50 sm:inline-flex">
            Open map
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {layerHighlights.map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                  <item.icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-sm">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-400">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-slate-800 bg-slate-950/45 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-emerald-100/70">
              <Globe2 className="h-4 w-4" />
              Student-built infrastructure intelligence
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-50">Map-first, typed, deployable, and ready for real adapters.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              The MVP runs on local JSON with clear source labels. The architecture keeps adapters, transformations,
              aggregation helpers, and UI layers separate so public sources can be added without rewriting the product.
            </p>
          </div>
          <Link
            href="/methodology"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-cyan-200/25 bg-slate-900 px-4 text-sm font-medium text-slate-100 transition hover:border-cyan-200/50"
          >
            <BookOpen className="h-4 w-4" />
            Read methodology
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
