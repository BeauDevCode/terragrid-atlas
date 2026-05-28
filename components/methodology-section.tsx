import { CheckCircle2, Database, FlaskConical, Layers3, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const sections = [
  {
    title: "What TerraGrid Atlas is",
    icon: Layers3,
    body: "TerraGrid Atlas is a map-first infrastructure intelligence app for exploring how power systems, data center load, market signals, and grid regions are distributed across the world."
  },
  {
    title: "How data is collected",
    icon: Database,
    body: "The MVP uses local sample datasets shaped around real public-data categories: power plants, substations, transmission corridors, grid regions, country energy statistics, price nodes, load snapshots, and alerts."
  },
  {
    title: "Live vs sample data",
    icon: CheckCircle2,
    body: "Records are labeled as sample, estimated, or live. This version ships with sample and estimated data so it can run without paid services, while adapter boundaries are ready for real providers."
  },
  {
    title: "Limitations",
    icon: ShieldAlert,
    body: "Transmission geometry is simplified, some data center loads are estimated, and market prices are representative. The app is meant for exploration and research context, not operational dispatch."
  },
  {
    title: "Future improvements",
    icon: FlaskConical,
    body: "Planned upgrades include live regional adapters, country geometry joins, improved facility deduplication, richer OSM imports, database-backed history, and user-saved research views."
  }
];

export function MethodologySection() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <section.icon className="h-5 w-5" />
              </span>
              <CardTitle>{section.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-slate-400">{section.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
