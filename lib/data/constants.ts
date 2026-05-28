import type { FuelType, InfrastructureStatus, InfrastructureType } from "./types";

export const fuelColors: Record<FuelType, string> = {
  coal: "#94a3b8",
  gas: "#60a5fa",
  nuclear: "#a78bfa",
  hydro: "#22d3ee",
  solar: "#facc15",
  wind: "#34d399",
  battery: "#2dd4bf",
  oil: "#fb923c",
  biomass: "#84cc16",
  geothermal: "#f472b6",
  mixed: "#cbd5e1"
};

export const infrastructureColors: Record<InfrastructureType, string> = {
  "power-plant": "#22d3ee",
  substation: "#34d399",
  "transmission-line": "#60a5fa",
  "data-center": "#a78bfa",
  "grid-region": "#38bdf8",
  "price-node": "#facc15",
  interconnection: "#fb7185",
  alert: "#f97316"
};

export const statusLabels: Record<InfrastructureStatus, string> = {
  operating: "Operating",
  planned: "Planned",
  retired: "Retired",
  "under-construction": "Under construction"
};

export const layerLabels = [
  { id: "powerPlants", label: "Power Plants", color: infrastructureColors["power-plant"] },
  { id: "transmissionLines", label: "Transmission Lines", color: infrastructureColors["transmission-line"] },
  { id: "substations", label: "Substations", color: infrastructureColors.substation },
  { id: "dataCenters", label: "Data Centers", color: infrastructureColors["data-center"] },
  { id: "gridRegions", label: "Grid Regions", color: infrastructureColors["grid-region"] },
  { id: "priceNodes", label: "Price Nodes", color: infrastructureColors["price-node"] },
  { id: "interconnections", label: "Interconnection Corridors", color: infrastructureColors.interconnection },
  { id: "alerts", label: "Alerts / Outages", color: infrastructureColors.alert },
  { id: "countryStats", label: "Country Energy Stats", color: "#14b8a6" }
] as const;

export type AtlasLayerId = (typeof layerLabels)[number]["id"];
