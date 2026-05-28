import { AppShell } from "@/components/app-shell";
import { CompareDashboard } from "@/components/compare/compare-dashboard";
import { getAtlasDataset } from "@/lib/data";

export const metadata = {
  title: "Compare Countries"
};

export default function ComparePage() {
  const dataset = getAtlasDataset();

  return (
    <AppShell>
      <div className="mb-7">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100/70">Country comparison</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-50">Compare grid infrastructure side by side.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Select two to four countries and compare installed capacity, generation mix, infrastructure counts, transmission
          metrics, electricity price signals, load context, and density.
        </p>
      </div>
      <CompareDashboard dataset={dataset} />
    </AppShell>
  );
}
