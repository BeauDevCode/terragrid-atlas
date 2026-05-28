"use client";

import { useMemo } from "react";
import { defaultLayerState } from "@/components/map/map-layer-controls";
import { WorldMap } from "@/components/map/world-map";
import type { AtlasDataset } from "@/lib/data";

export function CountryMapPreview({
  dataset,
  countryCode
}: {
  dataset: AtlasDataset;
  countryCode: string;
}) {
  const layers = useMemo(() => defaultLayerState(), []);

  return (
    <WorldMap
      compact
      dataset={dataset}
      filters={{ countryCode, dataMode: "all", infrastructureType: "all", status: "all" }}
      layers={layers}
      densityMode={false}
      selectedCountryCode={countryCode}
      onSelectCountry={() => undefined}
    />
  );
}
