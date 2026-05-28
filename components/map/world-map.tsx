"use client";

import maplibregl, {
  type GeoJSONSource,
  type LngLatBoundsLike,
  type MapGeoJSONFeature,
  type StyleSpecification
} from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import {
  infrastructureColors,
  type AtlasDataset,
  type AtlasFilters,
  type DataFreshness,
  type InfrastructureType
} from "@/lib/data";
import type { LayerState } from "./map-layer-controls";
import { Button } from "@/components/ui/button";

type PointProperties = {
  id: string;
  name: string;
  category: InfrastructureType;
  countryCode: string;
  country: string;
  operator: string;
  metric: string;
  status: string;
  mode: DataFreshness;
  notes: string;
};

type SelectedFeature = PointProperties & {
  longitude: number;
  latitude: number;
};

const mapStyle: StyleSpecification = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
    }
  },
  layers: [
    {
      id: "carto-dark-basemap",
      type: "raster",
      source: "carto-dark",
      paint: {
        "raster-opacity": 1,
        "raster-brightness-min": 0.14,
        "raster-brightness-max": 1,
        "raster-contrast": 0.24,
        "raster-saturation": -0.12
      }
    }
  ]
};

const continentPolygons: Array<{ name: string; coordinates: [number, number][] }> = [
  {
    name: "North America",
    coordinates: [
      [-168, 70],
      [-140, 73],
      [-112, 70],
      [-82, 62],
      [-58, 48],
      [-70, 24],
      [-96, 15],
      [-122, 22],
      [-138, 42],
      [-168, 58],
      [-168, 70]
    ]
  },
  {
    name: "South America",
    coordinates: [
      [-82, 12],
      [-54, 8],
      [-36, -18],
      [-46, -52],
      [-68, -56],
      [-80, -28],
      [-82, 12]
    ]
  },
  {
    name: "Europe",
    coordinates: [
      [-12, 58],
      [8, 70],
      [34, 60],
      [40, 44],
      [18, 36],
      [-8, 42],
      [-12, 58]
    ]
  },
  {
    name: "Africa",
    coordinates: [
      [-18, 34],
      [32, 34],
      [52, 12],
      [42, -34],
      [16, -36],
      [-16, -14],
      [-18, 34]
    ]
  },
  {
    name: "Asia",
    coordinates: [
      [34, 66],
      [86, 72],
      [146, 58],
      [154, 28],
      [116, 8],
      [78, 6],
      [48, 24],
      [34, 66]
    ]
  },
  {
    name: "Australia",
    coordinates: [
      [112, -12],
      [154, -18],
      [150, -42],
      [116, -44],
      [112, -12]
    ]
  }
];

const regionLabels: Array<{ label: string; coordinates: [number, number] }> = [
  { label: "North America", coordinates: [-104, 47] },
  { label: "South America", coordinates: [-62, -24] },
  { label: "Europe", coordinates: [16, 54] },
  { label: "Africa", coordinates: [20, 2] },
  { label: "Asia", coordinates: [94, 42] },
  { label: "Australia", coordinates: [134, -27] }
];

export function WorldMap({
  dataset,
  filters,
  layers,
  densityMode,
  selectedCountryCode,
  onSelectCountry,
  compact = false,
  showAttributionNote = true
}: {
  dataset: AtlasDataset;
  filters: AtlasFilters;
  layers: LayerState;
  densityMode: boolean;
  selectedCountryCode?: string;
  onSelectCountry: (countryCode: string) => void;
  compact?: boolean;
  showAttributionNote?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);

  const sources = useMemo(() => buildMapSources(dataset, filters, layers), [dataset, filters, layers]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [12, 24],
      zoom: 1.35,
      minZoom: 1,
      maxZoom: 12,
      attributionControl: { compact: true }
    });

    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", () => {
      map.addSource("atlas-points", {
        type: "geojson",
        data: sources.points,
        cluster: true,
        clusterRadius: 52,
        clusterMaxZoom: 5
      });

      map.addSource("atlas-lines", {
        type: "geojson",
        data: sources.lines
      });

      map.addSource("atlas-regions", {
        type: "geojson",
        data: sources.regions
      });

      map.addLayer({
        id: "atlas-region-fill",
        type: "fill",
        source: "atlas-regions",
        paint: {
          "fill-color": "#0ea5e9",
          "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.11, 0.035]
        }
      });

      map.addLayer({
        id: "atlas-region-outline",
        type: "line",
        source: "atlas-regions",
        paint: {
          "line-color": "#38bdf8",
          "line-opacity": 0.34,
          "line-width": 1.2
        }
      });

      map.addLayer({
        id: "atlas-lines",
        type: "line",
        source: "atlas-lines",
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "corridorType"], "interconnection"],
            infrastructureColors.interconnection,
            infrastructureColors["transmission-line"]
          ],
          "line-opacity": 0.78,
          "line-width": ["interpolate", ["linear"], ["zoom"], 1, 1, 5, 2.6, 9, 5]
        }
      });

      map.addLayer({
        id: "atlas-density",
        type: "heatmap",
        source: "atlas-points",
        maxzoom: 8,
        layout: { visibility: densityMode ? "visible" : "none" },
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 10, 1],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 1, 0.7, 8, 2.3],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(8, 20, 32, 0)",
            0.25,
            "rgba(45, 212, 191, 0.45)",
            0.55,
            "rgba(34, 211, 238, 0.72)",
            0.85,
            "rgba(250, 204, 21, 0.85)"
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 1, 22, 8, 36],
          "heatmap-opacity": 0.74
        }
      });

      map.addLayer({
        id: "atlas-clusters",
        type: "circle",
        source: "atlas-points",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "rgba(34, 211, 238, 0.78)",
          "circle-radius": ["step", ["get", "point_count"], 17, 8, 23, 18, 30],
          "circle-stroke-color": "rgba(226, 232, 240, 0.8)",
          "circle-stroke-width": 1
        }
      });

      map.addLayer({
        id: "atlas-cluster-count",
        type: "symbol",
        source: "atlas-points",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold"],
          "text-size": 12
        },
        paint: {
          "text-color": "#02111d"
        }
      });

      map.addLayer({
        id: "atlas-points",
        type: "circle",
        source: "atlas-points",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match",
            ["get", "category"],
            "power-plant",
            infrastructureColors["power-plant"],
            "substation",
            infrastructureColors.substation,
            "data-center",
            infrastructureColors["data-center"],
            "price-node",
            infrastructureColors["price-node"],
            "alert",
            infrastructureColors.alert,
            "#cbd5e1"
          ],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 4.5, 5, 7, 9, 10],
          "circle-stroke-color": "#061019",
          "circle-stroke-width": 1.5,
          "circle-opacity": densityMode ? 0.42 : 0.95
        }
      });

      map.addLayer({
        id: "atlas-point-labels",
        type: "symbol",
        source: "atlas-points",
        minzoom: 4.6,
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.2],
          "text-anchor": "top"
        },
        paint: {
          "text-color": "#e2e8f0",
          "text-halo-color": "#020617",
          "text-halo-width": 1.5
        }
      });

      map.on("click", "atlas-clusters", (event) => {
        const features = map.queryRenderedFeatures(event.point, { layers: ["atlas-clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("atlas-points") as GeoJSONSource;
        if (clusterId === undefined) return;

        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom
          });
        });
      });

      map.on("click", "atlas-points", (event) => {
        const feature = event.features?.[0];
        const coordinates = (feature?.geometry as GeoJSON.Point | undefined)?.coordinates as [number, number] | undefined;
        if (!feature || !coordinates) return;
        const properties = normalizeProperties(feature);
        setSelectedFeature({ ...properties, longitude: coordinates[0], latitude: coordinates[1] });
        onSelectCountry(properties.countryCode);
        new maplibregl.Popup({ offset: 14 })
          .setLngLat(coordinates)
          .setHTML(popupHtml(properties))
          .addTo(map);
      });

      map.on("click", "atlas-lines", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const properties = feature.properties as Record<string, string>;
        if (properties.countryCode) {
          onSelectCountry(properties.countryCode);
        }
        const lngLat = event.lngLat;
        new maplibregl.Popup({ offset: 14 })
          .setLngLat(lngLat)
          .setHTML(
            popupHtml({
              id: properties.id,
              name: properties.name,
              category: "transmission-line",
              country: properties.country,
              countryCode: properties.countryCode,
              operator: properties.operator,
              metric: `${properties.voltageKV} kV / ${properties.lengthKm} km`,
              status: properties.status,
              mode: properties.mode as DataFreshness,
              notes: properties.notes
            })
          )
          .addTo(map);
      });

      map.on("click", "atlas-region-fill", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const properties = feature.properties as Record<string, string>;
        if (properties.countryCode) {
          onSelectCountry(properties.countryCode);
        }
      });

      const interactiveLayers = ["atlas-points", "atlas-clusters", "atlas-lines", "atlas-region-fill"];
      interactiveLayers.forEach((layerId) => {
        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
          popupRef.current?.remove();
        });
      });

      map.on("mousemove", "atlas-points", (event) => {
        const feature = event.features?.[0];
        const coordinates = (feature?.geometry as GeoJSON.Point | undefined)?.coordinates as [number, number] | undefined;
        if (!feature || !coordinates) return;
        popupRef.current
          ?.setLngLat(coordinates)
          .setHTML(`<div style="padding:10px 12px;font-size:12px"><strong>${feature.properties?.name}</strong><br/>${feature.properties?.metric}</div>`)
          .addTo(map);
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [densityMode, onSelectCountry, sources.lines, sources.points, sources.regions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    (map.getSource("atlas-points") as GeoJSONSource | undefined)?.setData(sources.points);
    (map.getSource("atlas-lines") as GeoJSONSource | undefined)?.setData(sources.lines);
    (map.getSource("atlas-regions") as GeoJSONSource | undefined)?.setData(sources.regions);
  }, [sources]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer("atlas-density")) return;
    map.setLayoutProperty("atlas-density", "visibility", densityMode ? "visible" : "none");
    map.setPaintProperty("atlas-points", "circle-opacity", densityMode ? 0.42 : 0.95);
  }, [densityMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCountryCode) return;
    const region = dataset.gridRegions.find((item) => item.countryCode === selectedCountryCode);
    const country = dataset.countries.find((item) => item.iso2 === selectedCountryCode);
    if (region) {
      const [west, south, east, north] = region.bbox;
      map.fitBounds(
        [
          [west, south],
          [east, north]
        ] as LngLatBoundsLike,
        { padding: 70, duration: 900, maxZoom: 5.2 }
      );
    } else if (country) {
      map.easeTo({ center: country.centroid, zoom: 4, duration: 900 });
    }
  }, [dataset.countries, dataset.gridRegions, selectedCountryCode]);

  return (
    <div
      className={
        compact
          ? "relative h-80 overflow-hidden rounded-lg bg-[#07131d]"
          : "terragrid-map-shell relative h-full min-h-[620px] overflow-hidden rounded-none bg-[#07131d]"
      }
    >
      <div ref={containerRef} className="absolute inset-0" />
      {!compact ? <StaticWorldContextOverlay dataset={dataset} sources={sources} /> : null}
      {!compact ? <StaticAtlasOverlay sources={sources} /> : null}
      {!compact && showAttributionNote ? <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-sm rounded-md border border-slate-700/70 bg-slate-950/74 px-3 py-2 text-xs text-slate-400 backdrop-blur">
        Basemap: CARTO dark matter. Infrastructure layers are sample or estimated records.
      </div> : null}
      {selectedFeature && !compact ? (
        <div className="glass-panel pointer-events-auto absolute bottom-4 right-16 z-10 w-[320px] rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/60">Selected asset</p>
              <h3 className="mt-1 truncate text-sm font-semibold text-slate-50">{selectedFeature.name}</h3>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setSelectedFeature(null)} title="Close selected asset">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <dl className="mt-3 grid gap-2 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Type</dt>
              <dd className="capitalize text-slate-200">{selectedFeature.category.replace("-", " ")}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Metric</dt>
              <dd className="text-slate-200">{selectedFeature.metric}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Operator</dt>
              <dd className="truncate text-right text-slate-200">{selectedFeature.operator}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}

function buildMapSources(dataset: AtlasDataset, filters: AtlasFilters, layers: LayerState) {
  const countryCodes = new Set(
    dataset.countries
      .filter((country) => (filters.continent ? country.continent === filters.continent : true))
      .map((country) => country.iso2)
  );

  const pointFeatures: GeoJSON.Feature<GeoJSON.Point, PointProperties & { weight: number }>[] = [];

  if (layers.powerPlants && matchesInfrastructureType(filters, "power-plant")) {
    dataset.powerPlants
      .filter((plant) => matchesCommon(plant, filters, countryCodes))
      .filter((plant) => (filters.fuelType && filters.fuelType !== "all" ? plant.fuelType === filters.fuelType : true))
      .filter((plant) =>
        filters.capacityRange ? plant.capacityMW >= filters.capacityRange[0] && plant.capacityMW <= filters.capacityRange[1] : true
      )
      .filter((plant) => (filters.year ? plant.commissioningYear <= filters.year : true))
      .forEach((plant) => {
        pointFeatures.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [plant.longitude, plant.latitude] },
          properties: {
            id: plant.id,
            name: plant.name,
            category: "power-plant",
            countryCode: plant.countryCode,
            country: plant.country,
            operator: plant.operator,
            metric: `${plant.capacityMW.toLocaleString()} MW ${plant.fuelType}`,
            status: plant.status,
            mode: plant.source.freshness,
            notes: plant.notes,
            weight: Math.max(1, Math.log10(plant.capacityMW))
          }
        });
      });
  }

  if (layers.substations && matchesInfrastructureType(filters, "substation")) {
    dataset.substations
      .filter((substation) => matchesCommon(substation, filters, countryCodes))
      .filter((substation) => matchesVoltage(substation.voltageKV, filters.voltageClass))
      .forEach((substation) => {
        pointFeatures.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [substation.longitude, substation.latitude] },
          properties: {
            id: substation.id,
            name: substation.name,
            category: "substation",
            countryCode: substation.countryCode,
            country: substation.country,
            operator: substation.operator,
            metric: `${substation.voltageKV} kV node`,
            status: substation.status,
            mode: substation.source.freshness,
            notes: substation.notes,
            weight: Math.max(1, substation.voltageKV / 120)
          }
        });
      });
  }

  if (layers.dataCenters && matchesInfrastructureType(filters, "data-center")) {
    dataset.dataCenters
      .filter((center) => matchesCommon(center, filters, countryCodes))
      .forEach((center) => {
        pointFeatures.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [center.longitude, center.latitude] },
          properties: {
            id: center.id,
            name: center.name,
            category: "data-center",
            countryCode: center.countryCode,
            country: center.country,
            operator: center.operator,
            metric: `${center.estimatedLoadMW} MW estimated load`,
            status: center.status,
            mode: center.source.freshness,
            notes: center.notes,
            weight: Math.max(1, center.estimatedLoadMW / 40)
          }
        });
      });
  }

  if (layers.priceNodes && matchesInfrastructureType(filters, "price-node")) {
    dataset.priceNodes
      .filter((node) => matchesCountryAndMode(node, filters, countryCodes))
      .filter((node) => matchesQuery(filters.query, [node.name, node.country, node.market]))
      .forEach((node) => {
        pointFeatures.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [node.longitude, node.latitude] },
          properties: {
            id: node.id,
            name: node.name,
            category: "price-node",
            countryCode: node.countryCode,
            country: node.country,
            operator: node.market,
            metric: `${node.currency} ${node.pricePerMWh}/MWh`,
            status: node.dataMode,
            mode: node.dataMode,
            notes: "Representative market signal for atlas comparison.",
            weight: Math.max(1, node.pricePerMWh / 20)
          }
        });
      });
  }

  if (layers.alerts && matchesInfrastructureType(filters, "alert")) {
    dataset.alerts
      .filter((alert) => matchesCountryAndMode(alert, filters, countryCodes))
      .filter((alert) => matchesQuery(filters.query, [alert.title, alert.country, alert.category, alert.affectedAsset]))
      .forEach((alert) => {
        pointFeatures.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [alert.longitude, alert.latitude] },
          properties: {
            id: alert.id,
            name: alert.title,
            category: "alert",
            countryCode: alert.countryCode,
            country: alert.country,
            operator: alert.affectedAsset,
            metric: `${alert.severity} ${alert.category}`,
            status: alert.status,
            mode: alert.source.freshness,
            notes: alert.description,
            weight: alert.severity === "high" ? 8 : alert.severity === "medium" ? 5 : 3
          }
        });
      });
  }

  if (layers.countryStats && matchesInfrastructureType(filters, "grid-region")) {
    dataset.countryEnergyStats
      .filter((stat) => matchesCountryAndMode(stat, filters, countryCodes))
      .filter((stat) => matchesQuery(filters.query, [stat.country, stat.region]))
      .forEach((stat) => {
        const country = dataset.countries.find((item) => item.iso2 === stat.countryCode);
        if (!country) return;
        pointFeatures.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: country.centroid },
          properties: {
            id: `country-stat-${stat.countryCode}`,
            name: `${stat.country} energy statistics`,
            category: "grid-region",
            countryCode: stat.countryCode,
            country: stat.country,
            operator: country.gridOperator,
            metric: `${Math.round(stat.installedCapacityMW / 1000).toLocaleString()} GW installed`,
            status: stat.dataMode,
            mode: stat.dataMode,
            notes: `${stat.renewableShare}% renewable share; ${stat.demandPeakGW} GW peak demand.`,
            weight: Math.max(1, Math.log10(stat.installedCapacityMW))
          }
        });
      });
  }

  const lineFeatures: GeoJSON.Feature<GeoJSON.LineString>[] =
    layers.transmissionLines && matchesInfrastructureType(filters, "transmission-line")
      ? dataset.transmissionLines
          .filter((line) => matchesCommon(line, filters, countryCodes))
          .filter((line) => matchesVoltage(line.voltageKV, filters.voltageClass))
          .filter((line) => (line.corridorType === "interconnection" ? layers.interconnections : true))
          .map((line) => ({
            type: "Feature",
            geometry: { type: "LineString", coordinates: line.coordinates },
            properties: {
              id: line.id,
              name: line.name,
              countryCode: line.countryCode,
              country: line.country,
              operator: line.operator,
              voltageKV: String(line.voltageKV),
              lengthKm: String(line.lengthKm),
              status: line.status,
              corridorType: line.corridorType,
              mode: line.source.freshness,
              notes: line.notes
            }
          }))
      : [];

  const regionFeatures: GeoJSON.Feature<GeoJSON.Polygon>[] =
    layers.gridRegions && matchesInfrastructureType(filters, "grid-region")
      ? dataset.gridRegions
          .filter((region) => matchesCountryAndMode(region, filters, countryCodes))
          .filter((region) => matchesQuery(filters.query, [region.name, region.country, region.operator]))
          .map((region) => ({
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [bboxToPolygon(region.bbox)] },
            properties: {
              id: region.id,
              name: region.name,
              countryCode: region.countryCode,
              country: region.country,
              operator: region.operator,
              mode: region.source.freshness
            }
          }))
      : [];

  return {
    points: {
      type: "FeatureCollection",
      features: pointFeatures
    } satisfies GeoJSON.FeatureCollection<GeoJSON.Point>,
    lines: {
      type: "FeatureCollection",
      features: lineFeatures
    } satisfies GeoJSON.FeatureCollection<GeoJSON.LineString>,
    regions: {
      type: "FeatureCollection",
      features: regionFeatures
    } satisfies GeoJSON.FeatureCollection<GeoJSON.Polygon>
  };
}

function bboxToPolygon([west, south, east, north]: [number, number, number, number]): [number, number][] {
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south]
  ];
}

function matchesInfrastructureType(filters: AtlasFilters, type: InfrastructureType) {
  return !filters.infrastructureType || filters.infrastructureType === "all" || filters.infrastructureType === type;
}

function matchesCommon<T extends { countryCode: string; country: string; name: string; operator: string; status: string; source: { freshness: DataFreshness } }>(
  item: T,
  filters: AtlasFilters,
  allowedCountryCodes: Set<string>
) {
  return (
    matchesCountryAndMode(item, filters, allowedCountryCodes) &&
    matchesQuery(filters.query, [item.name, item.country, item.operator]) &&
    (!filters.status || filters.status === "all" || item.status === filters.status) &&
    (!filters.operator || item.operator === filters.operator)
  );
}

function matchesCountryAndMode<T extends { countryCode: string; source?: { freshness: DataFreshness }; dataMode?: DataFreshness }>(
  item: T,
  filters: AtlasFilters,
  allowedCountryCodes: Set<string>
) {
  const mode = item.dataMode ?? item.source?.freshness ?? "sample";
  return (
    allowedCountryCodes.has(item.countryCode) &&
    (!filters.countryCode || item.countryCode === filters.countryCode) &&
    (!filters.dataMode || filters.dataMode === "all" || mode === filters.dataMode)
  );
}

function matchesQuery(query: string | undefined, values: Array<string | number | undefined>) {
  if (!query?.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return values.some((value) => String(value ?? "").toLowerCase().includes(normalized));
}

function matchesVoltage(voltageKV: number, voltageClass?: string) {
  if (!voltageClass) return true;
  if (voltageClass === "distribution") return voltageKV < 220;
  if (voltageClass === "220") return voltageKV >= 220 && voltageKV < 380;
  if (voltageClass === "400") return voltageKV >= 380 && voltageKV < 700;
  if (voltageClass === "700") return voltageKV >= 700;
  return true;
}

function normalizeProperties(feature: MapGeoJSONFeature): PointProperties {
  const properties = feature.properties as Record<string, string>;
  return {
    id: properties.id,
    name: properties.name,
    category: properties.category as InfrastructureType,
    countryCode: properties.countryCode,
    country: properties.country,
    operator: properties.operator,
    metric: properties.metric,
    status: properties.status,
    mode: properties.mode as DataFreshness,
    notes: properties.notes
  };
}

function popupHtml(properties: PointProperties) {
  return `
    <div style="min-width:240px;padding:14px">
      <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#67e8f9">${properties.category.replace("-", " ")}</div>
      <div style="margin-top:6px;font-size:14px;font-weight:700;color:#f8fafc">${properties.name}</div>
      <div style="margin-top:10px;display:grid;gap:7px;font-size:12px;color:#cbd5e1">
        <div><span style="color:#64748b">Country:</span> ${properties.country}</div>
        <div><span style="color:#64748b">Operator:</span> ${properties.operator}</div>
        <div><span style="color:#64748b">Metric:</span> ${properties.metric}</div>
        <div><span style="color:#64748b">Status:</span> ${properties.status}</div>
      </div>
      <p style="margin:10px 0 0;color:#94a3b8;font-size:12px;line-height:1.45">${properties.notes}</p>
    </div>
  `;
}

function StaticWorldContextOverlay({
  dataset,
  sources
}: {
  dataset: AtlasDataset;
  sources: ReturnType<typeof buildMapSources>;
}) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="atlas-land-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#123348" stopOpacity="0.74" />
          <stop offset="56%" stopColor="#0d2736" stopOpacity="0.66" />
          <stop offset="100%" stopColor="#0b1e2c" stopOpacity="0.62" />
        </linearGradient>
        <filter id="atlas-land-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.18" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="100" height="100" fill="#07131d" opacity="0.3" />
      {continentPolygons.map((continent) => (
        <polygon
          key={continent.name}
          points={continent.coordinates.map((coordinate) => projectToViewport(coordinate)).join(" ")}
          fill="url(#atlas-land-gradient)"
          filter="url(#atlas-land-glow)"
          stroke="#5eead4"
          strokeOpacity="0.22"
          strokeWidth="0.18"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {sources.regions.features.map((feature) => {
        const points = feature.geometry.coordinates[0]?.map((coordinate) => projectToViewport([coordinate[0] ?? 0, coordinate[1] ?? 0])).join(" ");
        return points ? (
          <polyline
            key={String(feature.properties?.id)}
            points={points}
            fill="none"
            stroke="#93c5fd"
            strokeDasharray="0.6 0.42"
            strokeOpacity="0.24"
            strokeWidth="0.12"
            vectorEffect="non-scaling-stroke"
          />
        ) : null;
      })}

      {regionLabels.map((region) => {
        const [x, y] = projectToViewport(region.coordinates);
        return (
          <text
            key={region.label}
            x={x}
            y={y}
            fill="#dbeafe"
            fontSize="1.6"
            fontWeight="700"
            letterSpacing="0.11em"
            opacity="0.42"
            paintOrder="stroke"
            stroke="#03101a"
            strokeWidth="0.42"
            textAnchor="middle"
            vectorEffect="non-scaling-stroke"
          >
            {region.label.toUpperCase()}
          </text>
        );
      })}

      {dataset.countries.map((country) => {
        const [x, y] = projectToViewport(country.centroid);
        return (
          <text
            key={country.iso2}
            x={x}
            y={y}
            fill="#dbeafe"
            fontSize="1.05"
            fontWeight="600"
            letterSpacing="0.02em"
            opacity="0.72"
            paintOrder="stroke"
            stroke="#03101a"
            strokeWidth="0.3"
            textAnchor="middle"
            vectorEffect="non-scaling-stroke"
          >
            {country.name}
          </text>
        );
      })}
    </svg>
  );
}

function StaticAtlasOverlay({
  sources
}: {
  sources: ReturnType<typeof buildMapSources>;
}) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-[2] h-full w-full opacity-90" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id="atlas-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {sources.lines.features.map((feature) => {
        const points = feature.geometry.coordinates
          .map((coordinate) => projectToViewport([coordinate[0] ?? 0, coordinate[1] ?? 0]))
          .join(" ");
        const color =
          feature.properties?.corridorType === "interconnection"
            ? infrastructureColors.interconnection
            : infrastructureColors["transmission-line"];
        return (
          <polyline
            key={String(feature.properties?.id)}
            points={points}
            fill="none"
            stroke={color}
            strokeOpacity="0.48"
            strokeWidth="0.28"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {sources.points.features.map((feature) => {
        const [x, y] = projectToViewport([feature.geometry.coordinates[0] ?? 0, feature.geometry.coordinates[1] ?? 0]);
        const category = feature.properties?.category ?? "power-plant";
        const color = infrastructureColors[category] ?? "#22d3ee";
        const radius = category === "grid-region" ? 0.42 : category === "alert" ? 0.38 : category === "data-center" ? 0.34 : 0.3;
        return (
          <g key={String(feature.properties?.id)} filter="url(#atlas-glow)">
            <circle cx={x} cy={y} r={radius * 2.4} fill={color} fillOpacity="0.12" />
            <circle cx={x} cy={y} r={radius * 1.45} fill={color} fillOpacity="0.24" />
            <circle cx={x} cy={y} r={radius} fill={color} fillOpacity="0.95" />
          </g>
        );
      })}
    </svg>
  );
}

function projectToViewport([longitude, latitude]: [number, number]) {
  const x = ((longitude + 180) / 360) * 100;
  const boundedLat = Math.max(-85, Math.min(85, latitude));
  const radians = (boundedLat * Math.PI) / 180;
  const mercatorY = (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2;
  return [x, mercatorY * 100] as const;
}
