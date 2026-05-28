"use client";

import type { AtlasDataset, AtlasFilters, FuelType, InfrastructureStatus } from "@/lib/data";
import { Select } from "@/components/ui/input";
import { SourceBadge } from "@/components/source-badge";

const statuses: Array<InfrastructureStatus | "all"> = [
  "all",
  "operating",
  "planned",
  "under-construction",
  "retired"
];

const fuels: Array<FuelType | "all"> = [
  "all",
  "coal",
  "gas",
  "nuclear",
  "hydro",
  "solar",
  "wind",
  "battery",
  "oil",
  "biomass",
  "geothermal",
  "mixed"
];

export function FilterPanel({
  dataset,
  filters,
  onChange
}: {
  dataset: AtlasDataset;
  filters: AtlasFilters;
  onChange: (filters: AtlasFilters) => void;
}) {
  const continents = Array.from(new Set(dataset.countries.map((country) => country.continent))).sort();
  const operators = Array.from(
    new Set([
      ...dataset.powerPlants.map((item) => item.operator),
      ...dataset.substations.map((item) => item.operator),
      ...dataset.dataCenters.map((item) => item.operator),
      ...dataset.transmissionLines.map((item) => item.operator)
    ])
  ).sort();

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-100">Filters</h2>
        <SourceBadge mode={filters.dataMode ?? "sample"} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <label className="grid gap-1.5 text-xs text-slate-400">
          Country
          <Select
            value={filters.countryCode ?? ""}
            onChange={(event) => onChange({ ...filters, countryCode: event.target.value || undefined })}
          >
            <option value="">All countries</option>
            {dataset.countries.map((country) => (
              <option key={country.iso2} value={country.iso2}>
                {country.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Region / continent
          <Select
            value={filters.continent ?? ""}
            onChange={(event) => onChange({ ...filters, continent: event.target.value || undefined })}
          >
            <option value="">All regions</option>
            {continents.map((continent) => (
              <option key={continent} value={continent}>
                {continent}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Fuel type
          <Select
            value={filters.fuelType ?? "all"}
            onChange={(event) => onChange({ ...filters, fuelType: event.target.value as AtlasFilters["fuelType"] })}
          >
            {fuels.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel === "all" ? "All fuel types" : fuel}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Capacity range
          <Select
            value={filters.capacityRange?.join("-") ?? ""}
            onChange={(event) => {
              const [min, max] = event.target.value.split("-").map(Number);
              onChange({ ...filters, capacityRange: event.target.value ? [min, max] : undefined });
            }}
          >
            <option value="">All capacities</option>
            <option value="0-500">0-500 MW</option>
            <option value="500-2000">500 MW-2 GW</option>
            <option value="2000-100000">2 GW+</option>
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Voltage class
          <Select
            value={filters.voltageClass ?? ""}
            onChange={(event) => onChange({ ...filters, voltageClass: event.target.value || undefined })}
          >
            <option value="">All voltages</option>
            <option value="distribution">Distribution / sub-transmission</option>
            <option value="220">220-330 kV</option>
            <option value="400">380-500 kV</option>
            <option value="700">700 kV+</option>
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Infrastructure type
          <Select
            value={filters.infrastructureType ?? "all"}
            onChange={(event) =>
              onChange({ ...filters, infrastructureType: event.target.value as AtlasFilters["infrastructureType"] })
            }
          >
            <option value="all">All assets</option>
            <option value="power-plant">Power plants</option>
            <option value="substation">Substations</option>
            <option value="transmission-line">Transmission</option>
            <option value="data-center">Data centers</option>
            <option value="alert">Alerts</option>
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Status
          <Select
            value={filters.status ?? "all"}
            onChange={(event) => onChange({ ...filters, status: event.target.value as AtlasFilters["status"] })}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All statuses" : status}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Operator
          <Select
            value={filters.operator ?? ""}
            onChange={(event) => onChange({ ...filters, operator: event.target.value || undefined })}
          >
            <option value="">All operators</option>
            {operators.slice(0, 40).map((operator) => (
              <option key={operator} value={operator}>
                {operator}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Year
          <Select
            value={filters.year?.toString() ?? ""}
            onChange={(event) => onChange({ ...filters, year: event.target.value ? Number(event.target.value) : undefined })}
          >
            <option value="">All years</option>
            <option value="1990">In service by 1990</option>
            <option value="2010">In service by 2010</option>
            <option value="2020">In service by 2020</option>
            <option value="2026">Current demo year</option>
          </Select>
        </label>
        <label className="grid gap-1.5 text-xs text-slate-400">
          Live/demo mode
          <Select
            value={filters.dataMode ?? "sample"}
            onChange={(event) => onChange({ ...filters, dataMode: event.target.value as AtlasFilters["dataMode"] })}
          >
            <option value="all">All data modes</option>
            <option value="sample">Sample</option>
            <option value="estimated">Estimated</option>
            <option value="live">Live</option>
          </Select>
        </label>
      </div>
    </div>
  );
}
