export type DataFreshness = "live" | "sample" | "estimated";

export type InfrastructureStatus =
  | "operating"
  | "planned"
  | "retired"
  | "under-construction";

export type FuelType =
  | "coal"
  | "gas"
  | "nuclear"
  | "hydro"
  | "solar"
  | "wind"
  | "battery"
  | "oil"
  | "biomass"
  | "geothermal"
  | "mixed";

export type InfrastructureType =
  | "power-plant"
  | "substation"
  | "transmission-line"
  | "data-center"
  | "grid-region"
  | "price-node"
  | "interconnection"
  | "alert";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SourceInfo {
  name: string;
  url?: string;
  freshness: DataFreshness;
  updatedAt: string;
}

export interface CountryMetadata {
  iso2: string;
  iso3: string;
  name: string;
  flag: string;
  continent: string;
  region: string;
  populationMillions: number;
  areaKm2: number;
  centroid: [number, number];
  gridOperator: string;
  priceCurrency: string;
}

export interface PowerPlant extends Coordinates {
  id: string;
  name: string;
  countryCode: string;
  country: string;
  city: string;
  fuelType: FuelType;
  capacityMW: number;
  operator: string;
  status: InfrastructureStatus;
  commissioningYear: number;
  source: SourceInfo;
  notes: string;
}

export interface TransmissionLine {
  id: string;
  name: string;
  countryCode: string;
  country: string;
  from: string;
  to: string;
  voltageKV: number;
  lengthKm: number;
  operator: string;
  status: InfrastructureStatus;
  corridorType: "domestic" | "interconnection";
  coordinates: [number, number][];
  source: SourceInfo;
  notes: string;
}

export interface Substation extends Coordinates {
  id: string;
  name: string;
  countryCode: string;
  country: string;
  voltageKV: number;
  operator: string;
  status: InfrastructureStatus;
  source: SourceInfo;
  notes: string;
}

export interface DataCenter extends Coordinates {
  id: string;
  name: string;
  countryCode: string;
  country: string;
  city: string;
  estimatedLoadMW: number;
  operator: string;
  status: InfrastructureStatus;
  source: SourceInfo;
  notes: string;
}

export interface GridRegion {
  id: string;
  name: string;
  countryCode: string;
  country: string;
  operator: string;
  peakLoadGW: number;
  generationCapacityGW: number;
  interconnectionCount: number;
  status: "synchronized" | "islanded" | "partially-synchronized";
  bbox: [number, number, number, number];
  source: SourceInfo;
  notes: string;
}

export interface PriceNode extends Coordinates {
  id: string;
  name: string;
  countryCode: string;
  country: string;
  market: string;
  pricePerMWh: number;
  currency: string;
  dataMode: DataFreshness;
  updatedAt: string;
  source: SourceInfo;
}

export interface GridAlert extends Coordinates {
  id: string;
  title: string;
  countryCode: string;
  country: string;
  severity: "low" | "medium" | "high";
  category: "outage" | "weather" | "congestion" | "maintenance" | "market";
  startedAt: string;
  status: "monitoring" | "active" | "resolved";
  affectedAsset: string;
  description: string;
  source: SourceInfo;
}

export interface LiveMetric {
  id: string;
  countryCode: string;
  metric: "load" | "price" | "generation" | "renewables-share";
  label: string;
  unit: string;
  value: number;
  dataMode: DataFreshness;
  updatedAt: string;
  history: Array<{
    timestamp: string;
    value: number;
  }>;
}

export interface GenerationMix {
  fuelType: FuelType;
  capacityMW: number;
  share: number;
}

export interface CountryEnergyStat {
  countryCode: string;
  country: string;
  region: string;
  installedCapacityMW: number;
  annualGenerationTWh: number;
  demandPeakGW: number;
  averageLoadGW: number;
  averagePriceUsdMWh: number;
  gridCarbonIntensityGCO2KWh: number;
  electrificationRate: number;
  renewableShare: number;
  generationMix: GenerationMix[];
  dataMode: DataFreshness;
  updatedAt: string;
  source: SourceInfo;
}

export interface AtlasDataset {
  countries: CountryMetadata[];
  powerPlants: PowerPlant[];
  transmissionLines: TransmissionLine[];
  substations: Substation[];
  dataCenters: DataCenter[];
  gridRegions: GridRegion[];
  priceNodes: PriceNode[];
  alerts: GridAlert[];
  liveMetrics: LiveMetric[];
  countryEnergyStats: CountryEnergyStat[];
}

export interface AtlasFilters {
  query?: string;
  countryCode?: string;
  continent?: string;
  fuelType?: FuelType | "all";
  capacityRange?: [number, number];
  voltageClass?: string;
  infrastructureType?: InfrastructureType | "all";
  status?: InfrastructureStatus | "all";
  operator?: string;
  year?: number;
  dataMode?: DataFreshness | "all";
}

export interface AggregatedCountryMetrics {
  countryCode: string;
  country: string;
  installedCapacityMW: number;
  generationMix: GenerationMix[];
  powerPlantCount: number;
  substationCount: number;
  transmissionLengthKm: number;
  dataCenterCount: number;
  estimatedDataCenterLoadMW: number;
  activeAlerts: number;
  averagePriceUsdMWh: number;
  infrastructureDensity: number;
}
