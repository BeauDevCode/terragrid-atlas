import { AppShell } from "@/components/app-shell";
import { MethodologySection } from "@/components/methodology-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { providerRoadmap } from "@/lib/data";

export const metadata = {
  title: "Methodology"
};

export default function MethodologyPage() {
  return (
    <AppShell>
      <div className="mb-8 max-w-4xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100/70">About / methodology</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-50">Transparent infrastructure intelligence.</h1>
        <p className="mt-4 text-base leading-8 text-slate-300">
          TerraGrid Atlas is a student-built research interface for exploring global power infrastructure. It treats the map
          as the primary workspace, then layers charts and source labels around it so users can understand what is known,
          estimated, and still missing.
        </p>
      </div>

      <MethodologySection />

      <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Intended users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-400">
            <p>Students can use the atlas to learn how grid geography, generation mix, and infrastructure density vary.</p>
            <p>Researchers can use it as a lightweight prototype for combining public datasets into one interface.</p>
            <p>Citizens can use it to better understand the physical systems behind electricity, digital infrastructure, and reliability alerts.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider adapter roadmap</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {providerRoadmap.map((provider) => (
              <div key={provider.id} className="rounded-md border border-slate-800 bg-slate-950/45 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-100">{provider.label}</p>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                    {provider.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{provider.supports.join(" / ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 rounded-lg border border-slate-800 bg-slate-950/45 p-6">
        <h2 className="text-xl font-semibold text-slate-50">Data limitations</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
          The included dataset is intentionally transparent demo data. Facility records are representative, not exhaustive.
          Transmission lines are simplified corridors. Price and load signals are sample or estimated unless a future adapter
          marks them live. The goal is to show a credible architecture and research workflow without pretending the MVP is an
          operational control-room source.
        </p>
      </section>
    </AppShell>
  );
}
