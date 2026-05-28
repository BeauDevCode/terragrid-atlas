import { Database, Radio } from "lucide-react";
import { Badge } from "./ui/badge";
import type { DataFreshness } from "@/lib/data";

export function SourceBadge({ mode }: { mode: DataFreshness | "all" }) {
  if (mode === "live") {
    return (
      <Badge variant="green">
        <Radio className="h-3.5 w-3.5" />
        Live
      </Badge>
    );
  }

  if (mode === "estimated") {
    return (
      <Badge variant="amber">
        <Database className="h-3.5 w-3.5" />
        Estimated
      </Badge>
    );
  }

  if (mode === "all") {
    return (
      <Badge variant="cyan">
        <Database className="h-3.5 w-3.5" />
        Mixed
      </Badge>
    );
  }

  return (
    <Badge variant="slate">
      <Database className="h-3.5 w-3.5" />
      Sample
    </Badge>
  );
}
