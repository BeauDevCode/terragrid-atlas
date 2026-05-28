import Link from "next/link";
import { ArrowRight, Database, Globe2, Layers3, Network, PieChart, Search } from "lucide-react";
import { MiniAtlasBackdrop } from "./mini-atlas-backdrop";

const features = [
  { title: "Global infrastructure mapping", icon: Globe2 },
  { title: "Layered grid intelligence", icon: Layers3 },
  { title: "Country and regional dashboards", icon: Network },
  { title: "Energy statistics and generation mix", icon: PieChart },
  { title: "Research-friendly interface", icon: Search }
];

export function HeroSection() {
  return (
    <section className="relative -mx-4 -mt-8 min-h-[calc(100vh-64px)] overflow-hidden border-b border-slate-800 sm:-mx-6 lg:-mx-8">
      <MiniAtlasBackdrop />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,16,25,0.96)_0%,rgba(6,16,25,0.78)_48%,rgba(6,16,25,0.38)_100%)]" />
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] items-center">
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
              <Database className="h-3.5 w-3.5" />
              TerraGrid Atlas
            </div>
            <p className="mt-5 text-sm font-medium text-emerald-200">Global Grid Intelligence</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-normal text-slate-50 sm:text-6xl lg:text-7xl">
              Explore the world&apos;s power infrastructure
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              TerraGrid Atlas maps power plants, substations, transmission systems, data centers, and grid intelligence
              across the globe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/atlas"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-cyan-200"
              >
                Open Atlas
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/US"
                className="inline-flex h-12 items-center gap-2 rounded-md border border-cyan-200/25 bg-slate-950/70 px-5 text-sm font-semibold text-slate-100 backdrop-blur transition hover:border-cyan-200/50 hover:bg-slate-900"
              >
                View Demo Region
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 pb-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-slate-700/60 bg-slate-950/68 p-4 backdrop-blur">
              <feature.icon className="h-5 w-5 text-cyan-200" />
              <p className="mt-3 text-sm font-medium leading-5 text-slate-100">{feature.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
