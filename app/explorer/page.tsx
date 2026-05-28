import { AppShell } from "@/components/app-shell";
import { InfrastructureTable } from "@/components/explorer/infrastructure-table";
import { getAtlasDataset, getExplorerRows } from "@/lib/data";

export const metadata = {
  title: "Infrastructure Explorer"
};

export default function ExplorerPage() {
  const dataset = getAtlasDataset();
  const rows = getExplorerRows(dataset);

  return (
    <AppShell>
      <div className="mb-7">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100/70">Infrastructure explorer</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-50">Browse the atlas records.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
          Search, sort, filter, inspect, and export the local demo records that power the TerraGrid Atlas MVP.
        </p>
      </div>
      <InfrastructureTable rows={rows} />
    </AppShell>
  );
}
