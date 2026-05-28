import { AtlasWorkspace } from "@/components/atlas/atlas-workspace";
import { AppShell } from "@/components/app-shell";
import { getAtlasDataset } from "@/lib/data";

export const metadata = {
  title: "Global Atlas"
};

export default function AtlasPage() {
  const dataset = getAtlasDataset();

  return (
    <AppShell fullBleed hideNavbar>
      <AtlasWorkspace dataset={dataset} />
    </AppShell>
  );
}
