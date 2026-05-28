import alerts from "@/data/sample/grid-alerts.json";
import countries from "@/data/sample/countries.json";
import countryEnergyStats from "@/data/sample/country-energy-stats.json";
import dataCenters from "@/data/sample/data-centers.json";
import gridRegions from "@/data/sample/grid-regions.json";
import liveMetrics from "@/data/sample/live-metrics.json";
import powerPlants from "@/data/sample/power-plants.json";
import priceNodes from "@/data/sample/price-nodes.json";
import substations from "@/data/sample/substations.json";
import transmissionLines from "@/data/sample/transmission-lines.json";
import type {
  AtlasDataset,
  CountryEnergyStat,
  CountryMetadata,
  DataCenter,
  GridAlert,
  GridRegion,
  LiveMetric,
  PowerPlant,
  PriceNode,
  Substation,
  TransmissionLine
} from "./types";

export interface DatasetAdapter<T> {
  id: string;
  label: string;
  mode: "sample" | "live" | "hybrid";
  load: () => Promise<T[]> | T[];
}

export const sampleAdapters = {
  countries: {
    id: "sample:countries",
    label: "Sample country metadata",
    mode: "sample",
    load: () => countries as CountryMetadata[]
  },
  powerPlants: {
    id: "sample:power-plants",
    label: "Sample power plant facilities",
    mode: "sample",
    load: () => powerPlants as PowerPlant[]
  },
  transmissionLines: {
    id: "sample:transmission-lines",
    label: "Sample transmission corridors",
    mode: "sample",
    load: () => transmissionLines as TransmissionLine[]
  },
  substations: {
    id: "sample:substations",
    label: "Sample substation facilities",
    mode: "sample",
    load: () => substations as Substation[]
  },
  dataCenters: {
    id: "sample:data-centers",
    label: "Sample data center facilities",
    mode: "sample",
    load: () => dataCenters as DataCenter[]
  },
  gridRegions: {
    id: "sample:grid-regions",
    label: "Sample grid operator regions",
    mode: "sample",
    load: () => gridRegions as GridRegion[]
  },
  priceNodes: {
    id: "sample:price-nodes",
    label: "Sample electricity price nodes",
    mode: "sample",
    load: () => priceNodes as PriceNode[]
  },
  alerts: {
    id: "sample:grid-alerts",
    label: "Sample grid events and alerts",
    mode: "sample",
    load: () => alerts as GridAlert[]
  },
  liveMetrics: {
    id: "sample:live-metrics",
    label: "Sample live metric snapshots",
    mode: "sample",
    load: () => liveMetrics as LiveMetric[]
  },
  countryEnergyStats: {
    id: "sample:country-energy-stats",
    label: "Sample country energy statistics",
    mode: "sample",
    load: () => countryEnergyStats as CountryEnergyStat[]
  }
} satisfies Record<string, DatasetAdapter<unknown>>;

export function getAtlasDataset(): AtlasDataset {
  return {
    countries: sampleAdapters.countries.load() as CountryMetadata[],
    powerPlants: sampleAdapters.powerPlants.load() as PowerPlant[],
    transmissionLines: sampleAdapters.transmissionLines.load() as TransmissionLine[],
    substations: sampleAdapters.substations.load() as Substation[],
    dataCenters: sampleAdapters.dataCenters.load() as DataCenter[],
    gridRegions: sampleAdapters.gridRegions.load() as GridRegion[],
    priceNodes: sampleAdapters.priceNodes.load() as PriceNode[],
    alerts: sampleAdapters.alerts.load() as GridAlert[],
    liveMetrics: sampleAdapters.liveMetrics.load() as LiveMetric[],
    countryEnergyStats: sampleAdapters.countryEnergyStats.load() as CountryEnergyStat[]
  };
}

export const providerRoadmap = [
  {
    id: "osm-overpass",
    label: "OpenStreetMap / Overpass",
    supports: ["substations", "transmission-lines", "power-plants"],
    status: "adapter-ready"
  },
  {
    id: "global-power-plant-database",
    label: "Global Power Plant Database",
    supports: ["power-plants"],
    status: "adapter-ready"
  },
  {
    id: "world-bank-iea-ember",
    label: "World Bank / IEA / Ember style country metrics",
    supports: ["country-energy-stats", "generation-mix"],
    status: "adapter-ready"
  },
  {
    id: "entsoe-style",
    label: "ENTSO-E style public load and price data",
    supports: ["live-metrics", "price-nodes", "alerts"],
    status: "region-limited"
  },
  {
    id: "eia-style",
    label: "EIA style power and fuel mix data",
    supports: ["country-energy-stats", "live-metrics"],
    status: "region-limited"
  }
] as const;
