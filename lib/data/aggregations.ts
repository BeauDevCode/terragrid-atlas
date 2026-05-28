import type {
  AggregatedCountryMetrics,
  AtlasDataset,
  AtlasFilters,
  CountryEnergyStat,
  DataCenter,
  GenerationMix,
  GridAlert,
  PowerPlant,
  Substation,
  TransmissionLine
} from "./types";

export function formatCompactNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits
  }).format(value);
}

export function formatCapacity(mw: number) {
  if (mw >= 1000) {
    return `${(mw / 1000).toLocaleString("en", { maximumFractionDigits: 1 })} GW`;
  }

  return `${mw.toLocaleString("en", { maximumFractionDigits: 0 })} MW`;
}

export function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}

export function getActiveAlerts(alerts: GridAlert[]) {
  return alerts.filter((alert) => alert.status !== "resolved");
}

export function getCapacityByFuel(plants: PowerPlant[]): GenerationMix[] {
  const totals = plants.reduce<Record<string, number>>((acc, plant) => {
    acc[plant.fuelType] = (acc[plant.fuelType] ?? 0) + plant.capacityMW;
    return acc;
  }, {});
  const totalCapacity = Object.values(totals).reduce((sum, capacity) => sum + capacity, 0);

  return Object.entries(totals)
    .map(([fuelType, capacityMW]) => ({
      fuelType: fuelType as GenerationMix["fuelType"],
      capacityMW,
      share: totalCapacity ? Math.round((capacityMW / totalCapacity) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.capacityMW - a.capacityMW);
}

export function getWorldOverview(dataset: AtlasDataset) {
  const installedCapacityMW = sumBy(dataset.countryEnergyStats, (stat) => stat.installedCapacityMW);
  const transmissionLengthKm = sumBy(dataset.transmissionLines, (line) => line.lengthKm);
  const averagePrice =
    sumBy(dataset.countryEnergyStats, (stat) => stat.averagePriceUsdMWh) /
    Math.max(dataset.countryEnergyStats.length, 1);
  const realtimeLoadGW = sumBy(
    dataset.liveMetrics.filter((metric) => metric.metric === "load"),
    (metric) => metric.value
  );

  return {
    installedCapacityMW,
    powerPlantCount: dataset.powerPlants.length,
    substationCount: dataset.substations.length,
    transmissionLengthKm,
    dataCenterCount: dataset.dataCenters.length,
    countriesCovered: dataset.countries.length,
    activeAlerts: getActiveAlerts(dataset.alerts).length,
    liveSourcesConnected: 0,
    averagePriceUsdMWh: averagePrice,
    realtimeLoadGW
  };
}

export function getCountryMetrics(dataset: AtlasDataset, countryCode: string): AggregatedCountryMetrics | undefined {
  const country = dataset.countries.find((item) => item.iso2 === countryCode);
  const stat = dataset.countryEnergyStats.find((item) => item.countryCode === countryCode);

  if (!country || !stat) {
    return undefined;
  }

  const powerPlants = dataset.powerPlants.filter((item) => item.countryCode === countryCode);
  const substations = dataset.substations.filter((item) => item.countryCode === countryCode);
  const transmissionLines = dataset.transmissionLines.filter((item) => item.countryCode === countryCode);
  const dataCenters = dataset.dataCenters.filter((item) => item.countryCode === countryCode);
  const alerts = dataset.alerts.filter((item) => item.countryCode === countryCode && item.status !== "resolved");
  const densityBase = country.areaKm2 / 100000;

  return {
    countryCode,
    country: country.name,
    installedCapacityMW: stat.installedCapacityMW,
    generationMix: stat.generationMix,
    powerPlantCount: powerPlants.length,
    substationCount: substations.length,
    transmissionLengthKm: sumBy(transmissionLines, (line) => line.lengthKm),
    dataCenterCount: dataCenters.length,
    estimatedDataCenterLoadMW: sumBy(dataCenters, (center) => center.estimatedLoadMW),
    activeAlerts: alerts.length,
    averagePriceUsdMWh: stat.averagePriceUsdMWh,
    infrastructureDensity:
      (powerPlants.length + substations.length + dataCenters.length + transmissionLines.length) /
      Math.max(densityBase, 1)
  };
}

export function getCountryBundle(dataset: AtlasDataset, countryCode: string) {
  return {
    metadata: dataset.countries.find((country) => country.iso2 === countryCode),
    stat: dataset.countryEnergyStats.find((stat) => stat.countryCode === countryCode),
    powerPlants: dataset.powerPlants.filter((plant) => plant.countryCode === countryCode),
    substations: dataset.substations.filter((substation) => substation.countryCode === countryCode),
    transmissionLines: dataset.transmissionLines.filter((line) => line.countryCode === countryCode),
    dataCenters: dataset.dataCenters.filter((center) => center.countryCode === countryCode),
    priceNodes: dataset.priceNodes.filter((node) => node.countryCode === countryCode),
    alerts: dataset.alerts.filter((alert) => alert.countryCode === countryCode),
    liveMetrics: dataset.liveMetrics.filter((metric) => metric.countryCode === countryCode)
  };
}

export function getTopCountriesByCapacity(stats: CountryEnergyStat[], limit = 6) {
  return [...stats].sort((a, b) => b.installedCapacityMW - a.installedCapacityMW).slice(0, limit);
}

export function getInfrastructureCounts(dataset: AtlasDataset, countryCode?: string) {
  const filterCountry = <T extends { countryCode: string }>(items: T[]) =>
    countryCode ? items.filter((item) => item.countryCode === countryCode) : items;

  return [
    { name: "Power plants", value: filterCountry(dataset.powerPlants).length },
    { name: "Substations", value: filterCountry(dataset.substations).length },
    { name: "Transmission", value: filterCountry(dataset.transmissionLines).length },
    { name: "Data centers", value: filterCountry(dataset.dataCenters).length },
    { name: "Price nodes", value: filterCountry(dataset.priceNodes).length },
    { name: "Alerts", value: filterCountry(dataset.alerts).filter((alert) => alert.status !== "resolved").length }
  ];
}

export function getOperatorsSummary(
  assets: Array<PowerPlant | Substation | DataCenter | TransmissionLine>,
  limit = 5
) {
  const counts = assets.reduce<Record<string, number>>((acc, asset) => {
    acc[asset.operator] = (acc[asset.operator] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([operator, count]) => ({ operator, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function filterPowerPlants(plants: PowerPlant[], filters: AtlasFilters) {
  return plants.filter((plant) => {
    const query = filters.query?.toLowerCase().trim();
    const matchesQuery = query
      ? [plant.name, plant.country, plant.city, plant.operator, plant.fuelType].some((value) =>
          value.toLowerCase().includes(query)
        )
      : true;
    const matchesCountry = filters.countryCode ? plant.countryCode === filters.countryCode : true;
    const matchesFuel = filters.fuelType && filters.fuelType !== "all" ? plant.fuelType === filters.fuelType : true;
    const matchesStatus = filters.status && filters.status !== "all" ? plant.status === filters.status : true;
    const matchesCapacity = filters.capacityRange
      ? plant.capacityMW >= filters.capacityRange[0] && plant.capacityMW <= filters.capacityRange[1]
      : true;
    const matchesYear = filters.year ? plant.commissioningYear <= filters.year : true;

    return matchesQuery && matchesCountry && matchesFuel && matchesStatus && matchesCapacity && matchesYear;
  });
}

export function getExplorerRows(dataset: AtlasDataset) {
  return [
    ...dataset.powerPlants.map((item) => ({
      id: item.id,
      type: "Power plant",
      name: item.name,
      country: item.country,
      countryCode: item.countryCode,
      location: item.city,
      coordinates: `${item.latitude.toFixed(3)}, ${item.longitude.toFixed(3)}`,
      rating: formatCapacity(item.capacityMW),
      operator: item.operator,
      status: item.status,
      source: item.source.name,
      notes: item.notes
    })),
    ...dataset.substations.map((item) => ({
      id: item.id,
      type: "Substation",
      name: item.name,
      country: item.country,
      countryCode: item.countryCode,
      location: "Grid node",
      coordinates: `${item.latitude.toFixed(3)}, ${item.longitude.toFixed(3)}`,
      rating: `${item.voltageKV} kV`,
      operator: item.operator,
      status: item.status,
      source: item.source.name,
      notes: item.notes
    })),
    ...dataset.transmissionLines.map((item) => ({
      id: item.id,
      type: "Transmission",
      name: item.name,
      country: item.country,
      countryCode: item.countryCode,
      location: `${item.from} to ${item.to}`,
      coordinates: `${item.coordinates[0][1].toFixed(3)}, ${item.coordinates[0][0].toFixed(3)}`,
      rating: `${item.voltageKV} kV / ${item.lengthKm.toLocaleString()} km`,
      operator: item.operator,
      status: item.status,
      source: item.source.name,
      notes: item.notes
    })),
    ...dataset.dataCenters.map((item) => ({
      id: item.id,
      type: "Data center",
      name: item.name,
      country: item.country,
      countryCode: item.countryCode,
      location: item.city,
      coordinates: `${item.latitude.toFixed(3)}, ${item.longitude.toFixed(3)}`,
      rating: `${item.estimatedLoadMW} MW est. load`,
      operator: item.operator,
      status: item.status,
      source: item.source.name,
      notes: item.notes
    }))
  ];
}
