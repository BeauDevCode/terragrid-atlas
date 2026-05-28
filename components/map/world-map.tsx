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

type DemoPointProperties = PointProperties & {
  demo: "visual-density";
  weight: number;
};

type DemoDensityHub = {
  code: string;
  country: string;
  continent: string;
  label: string;
  center: [number, number];
  intensity: number;
};

type DemoCorridor = {
  id: string;
  name: string;
  from: string;
  to: string;
  type: "domestic" | "interconnection";
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

const demoDensityHubs: DemoDensityHub[] = [
  { code: "US", country: "United States", continent: "North America", label: "PJM / Mid-Atlantic", center: [-77.5, 39.6], intensity: 12 },
  { code: "US", country: "United States", continent: "North America", label: "ERCOT / Texas", center: [-97.3, 31.2], intensity: 11 },
  { code: "US", country: "United States", continent: "North America", label: "WECC / California", center: [-120.2, 37.1], intensity: 10 },
  { code: "CA", country: "Canada", continent: "North America", label: "Ontario-Quebec", center: [-75.7, 45.6], intensity: 8 },
  { code: "MX", country: "Mexico", continent: "North America", label: "Mexico Central", center: [-99.2, 20.6], intensity: 7 },
  { code: "BR", country: "Brazil", continent: "South America", label: "Southeast Brazil", center: [-46.8, -22.9], intensity: 10 },
  { code: "GB", country: "United Kingdom", continent: "Europe", label: "GB National Grid", center: [-1.5, 52.7], intensity: 8 },
  { code: "FR", country: "France", continent: "Europe", label: "France RTE", center: [2.4, 47.2], intensity: 8 },
  { code: "DE", country: "Germany", continent: "Europe", label: "Germany TSOs", center: [10.3, 51.1], intensity: 11 },
  { code: "NL", country: "Netherlands", continent: "Europe", label: "Dutch grid hub", center: [5.2, 52.1], intensity: 7 },
  { code: "ES", country: "Spain", continent: "Europe", label: "Iberian grid", center: [-3.7, 40.3], intensity: 7 },
  { code: "IT", country: "Italy", continent: "Europe", label: "Italian north-south", center: [12.4, 43.2], intensity: 7 },
  { code: "NO", country: "Norway", continent: "Europe", label: "Nordic hydro", center: [9.1, 61.2], intensity: 6 },
  { code: "SE", country: "Sweden", continent: "Europe", label: "Swedish grid", center: [15.2, 60.2], intensity: 6 },
  { code: "PL", country: "Poland", continent: "Europe", label: "Poland balancing area", center: [19.1, 52.0], intensity: 7 },
  { code: "SA", country: "Saudi Arabia", continent: "Asia", label: "Saudi central grid", center: [45.3, 24.0], intensity: 7 },
  { code: "AE", country: "United Arab Emirates", continent: "Asia", label: "Gulf compute corridor", center: [54.4, 24.4], intensity: 6 },
  { code: "IN", country: "India", continent: "Asia", label: "India national grid", center: [78.8, 22.8], intensity: 12 },
  { code: "CN", country: "China", continent: "Asia", label: "East China grid", center: [116.4, 35.6], intensity: 13 },
  { code: "JP", country: "Japan", continent: "Asia", label: "Japan interconnection", center: [139.3, 36.3], intensity: 8 },
  { code: "KR", country: "South Korea", continent: "Asia", label: "Korea grid", center: [127.8, 36.2], intensity: 7 },
  { code: "AU", country: "Australia", continent: "Oceania", label: "NEM corridor", center: [148.2, -33.2], intensity: 9 },
  { code: "ZA", country: "South Africa", continent: "Africa", label: "South African grid", center: [27.9, -28.8], intensity: 8 },
  { code: "NG", country: "Nigeria", continent: "Africa", label: "Nigeria grid", center: [7.9, 9.2], intensity: 7 },
  { code: "EG", country: "Egypt", continent: "Africa", label: "Egypt grid", center: [30.6, 27.2], intensity: 6 }
];

const demoCorridors: DemoCorridor[] = [
  { id: "demo-us-east-canada", name: "Northeast intertie visual corridor", from: "US", to: "CA", type: "interconnection" },
  { id: "demo-us-mexico", name: "US-Mexico border grid visual corridor", from: "US", to: "MX", type: "interconnection" },
  { id: "demo-uk-fr", name: "Channel interconnection visual corridor", from: "GB", to: "FR", type: "interconnection" },
  { id: "demo-fr-de", name: "Continental Europe visual corridor", from: "FR", to: "DE", type: "interconnection" },
  { id: "demo-de-nl", name: "North Sea market visual corridor", from: "DE", to: "NL", type: "interconnection" },
  { id: "demo-de-pl", name: "Central Europe grid visual corridor", from: "DE", to: "PL", type: "interconnection" },
  { id: "demo-no-se", name: "Nordic hydro visual corridor", from: "NO", to: "SE", type: "interconnection" },
  { id: "demo-sa-ae", name: "Gulf grid visual corridor", from: "SA", to: "AE", type: "interconnection" },
  { id: "demo-in-cn", name: "Asian load center visual corridor", from: "IN", to: "CN", type: "interconnection" },
  { id: "demo-cn-kr-jp", name: "Northeast Asia visual corridor", from: "CN", to: "JP", type: "interconnection" },
  { id: "demo-ng-eg", name: "Africa north-south visual corridor", from: "NG", to: "EG", type: "interconnection" },
  { id: "demo-za-ng", name: "Sub-Saharan grid visual corridor", from: "ZA", to: "NG", type: "interconnection" },
  { id: "demo-br-south", name: "Brazilian hydro-load visual corridor", from: "BR", to: "BR", type: "domestic" },
  { id: "demo-au-nem", name: "Australian NEM visual corridor", from: "AU", to: "AU", type: "domestic" }
];

const demoCategoryCycle: InfrastructureType[] = [
  "power-plant",
  "substation",
  "data-center",
  "power-plant",
  "substation",
  "price-node",
  "grid-region",
  "power-plant",
  "data-center",
  "alert"
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

      map.addSource("atlas-demo-points", {
        type: "geojson",
        data: sources.demoPoints
      });

      map.addSource("atlas-demo-lines", {
        type: "geojson",
        data: sources.demoLines
      });

      map.addLayer({
        id: "atlas-region-fill",
        type: "fill",
        source: "atlas-regions",
        paint: {
          "fill-color": "#0ea5e9",
          "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.065, 0.014]
        }
      });

      map.addLayer({
        id: "atlas-region-outline",
        type: "line",
        source: "atlas-regions",
        paint: {
          "line-color": "#38bdf8",
          "line-opacity": 0.24,
          "line-width": 0.8
        }
      });

      map.addLayer({
        id: "atlas-demo-lines",
        type: "line",
        source: "atlas-demo-lines",
        layout: { visibility: densityMode ? "visible" : "none" },
        paint: {
          "line-color": ["case", ["==", ["get", "corridorType"], "interconnection"], "#22d3ee", "#34d399"],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 1, 0.34, 5, 0.54],
          "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.7, 5, 1.4, 9, 2.4],
          "line-blur": 0.45
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
          "line-opacity": 0.68,
          "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.7, 5, 1.8, 9, 3.2]
        }
      });

      map.addLayer({
        id: "atlas-demo-heat",
        type: "heatmap",
        source: "atlas-demo-points",
        maxzoom: 7,
        layout: { visibility: densityMode ? "visible" : "none" },
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 10, 1],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 1, 0.45, 7, 1.5],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(2, 6, 23, 0)",
            0.3,
            "rgba(34, 211, 238, 0.22)",
            0.62,
            "rgba(52, 211, 153, 0.38)",
            0.9,
            "rgba(245, 158, 11, 0.48)"
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 1, 18, 7, 28],
          "heatmap-opacity": 0.52
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
        id: "atlas-demo-point-glow",
        type: "circle",
        source: "atlas-demo-points",
        layout: { visibility: densityMode ? "visible" : "none" },
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
            "#2dd4bf"
          ],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 5.5, 5, 8.5, 9, 13],
          "circle-opacity": 0.18,
          "circle-blur": 0.58
        }
      });

      map.addLayer({
        id: "atlas-demo-points",
        type: "circle",
        source: "atlas-demo-points",
        layout: { visibility: densityMode ? "visible" : "none" },
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
            "#2dd4bf"
          ],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.4, 5, 4, 9, 6],
          "circle-stroke-color": "#020617",
          "circle-stroke-width": 0.7,
          "circle-opacity": 0.82
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
          "circle-opacity": densityMode ? 0.72 : 0.95
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

      const interactiveLayers = ["atlas-points", "atlas-demo-points", "atlas-clusters", "atlas-lines", "atlas-region-fill"];
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

      map.on("mousemove", "atlas-demo-points", (event) => {
        const feature = event.features?.[0];
        const coordinates = (feature?.geometry as GeoJSON.Point | undefined)?.coordinates as [number, number] | undefined;
        if (!feature || !coordinates) return;
        popupRef.current
          ?.setLngLat(coordinates)
          .setHTML(
            `<div style="padding:10px 12px;font-size:12px"><strong>${feature.properties?.name}</strong><br/>${feature.properties?.metric}<br/><span style="color:#fcd34d">Visual demo density point</span></div>`
          )
          .addTo(map);
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [densityMode, onSelectCountry, sources.demoLines, sources.demoPoints, sources.lines, sources.points, sources.regions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    (map.getSource("atlas-points") as GeoJSONSource | undefined)?.setData(sources.points);
    (map.getSource("atlas-lines") as GeoJSONSource | undefined)?.setData(sources.lines);
    (map.getSource("atlas-regions") as GeoJSONSource | undefined)?.setData(sources.regions);
    (map.getSource("atlas-demo-points") as GeoJSONSource | undefined)?.setData(sources.demoPoints);
    (map.getSource("atlas-demo-lines") as GeoJSONSource | undefined)?.setData(sources.demoLines);
  }, [sources]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer("atlas-density")) return;
    map.setLayoutProperty("atlas-density", "visibility", densityMode ? "visible" : "none");
    ["atlas-demo-heat", "atlas-demo-lines", "atlas-demo-point-glow", "atlas-demo-points"].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", densityMode ? "visible" : "none");
      }
    });
    map.setPaintProperty("atlas-points", "circle-opacity", densityMode ? 0.72 : 0.95);
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
      {!compact ? <StaticAtlasOverlay sources={sources} densityMode={densityMode} /> : null}
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

  const { demoPoints, demoLines } = buildDemoDensitySources(filters, layers);

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
    } satisfies GeoJSON.FeatureCollection<GeoJSON.Polygon>,
    demoPoints,
    demoLines
  };
}

function buildDemoDensitySources(filters: AtlasFilters, layers: LayerState) {
  const demoPoints: GeoJSON.Feature<GeoJSON.Point, DemoPointProperties>[] = [];

  demoDensityHubs.forEach((hub, hubIndex) => {
    if (!matchesDemoHub(hub, filters)) return;

    const count = Math.max(5, hub.intensity);
    for (let index = 0; index < count; index += 1) {
      const category = demoCategoryCycle[(index + hubIndex) % demoCategoryCycle.length];
      if (!isDemoCategoryVisible(category, layers, filters)) continue;

      const [longitude, latitude] = demoCoordinate(hub.center, index, hubIndex);
      demoPoints.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [longitude, latitude] },
        properties: {
          id: `demo-${hub.code.toLowerCase()}-${index}`,
          name: `${demoCategoryLabel(category)} sample - ${hub.label}`,
          category,
          countryCode: hub.code,
          country: hub.country,
          operator: "TerraGrid demo density layer",
          metric: "Visual sample infrastructure density",
          status: "sample",
          mode: "sample",
          notes: "Generated visual demo point for map density only; not a verified live infrastructure record.",
          demo: "visual-density",
          weight: Math.min(10, Math.max(2, hub.intensity / 1.4))
        }
      });
    }
  });

  const demoLines: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  if (layers.transmissionLines && matchesInfrastructureType(filters, "transmission-line") && filters.dataMode !== "live") {
    demoCorridors
      .filter((corridor) => (corridor.type === "interconnection" ? layers.interconnections : true))
      .filter((corridor) => matchesDemoCorridor(corridor, filters))
      .forEach((corridor) => {
        const from = demoDensityHubs.find((hub) => hub.code === corridor.from);
        const to = demoDensityHubs.find((hub) => hub.code === corridor.to && (corridor.to !== corridor.from || hub.label !== from?.label));
        if (!from) return;
        const end = to ?? { ...from, center: offsetDomesticCorridor(from.center) };
        const coordinates = buildArcCoordinates(from.center, end.center);
        demoLines.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates },
          properties: {
            id: corridor.id,
            name: corridor.name,
            countryCode: from.code,
            country: corridor.from === corridor.to ? from.country : `${from.country} / ${end.country}`,
            operator: "TerraGrid demo density layer",
            voltageKV: "visual",
            lengthKm: "sample",
            status: "sample",
            corridorType: corridor.type,
            mode: "sample",
            notes: "Generated visual demo transmission corridor for density and presentation context."
          }
        });
      });
  }

  return {
    demoPoints: {
      type: "FeatureCollection",
      features: demoPoints
    } satisfies GeoJSON.FeatureCollection<GeoJSON.Point>,
    demoLines: {
      type: "FeatureCollection",
      features: demoLines
    } satisfies GeoJSON.FeatureCollection<GeoJSON.LineString>
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

function matchesDemoHub(hub: DemoDensityHub, filters: AtlasFilters) {
  if (filters.dataMode === "live") return false;
  if (filters.countryCode && hub.code !== filters.countryCode) return false;
  if (filters.continent && hub.continent !== filters.continent) return false;
  if (filters.status && filters.status !== "all" && filters.status !== "operating") return false;
  return matchesQuery(filters.query, [hub.country, hub.label, hub.code]);
}

function matchesDemoCorridor(corridor: DemoCorridor, filters: AtlasFilters) {
  if (filters.countryCode && corridor.from !== filters.countryCode && corridor.to !== filters.countryCode) return false;
  const from = demoDensityHubs.find((hub) => hub.code === corridor.from);
  const to = demoDensityHubs.find((hub) => hub.code === corridor.to);
  if (!from) return false;
  if (filters.continent && from.continent !== filters.continent && to?.continent !== filters.continent) return false;
  return matchesQuery(filters.query, [corridor.name, from.country, to?.country]);
}

function isDemoCategoryVisible(category: InfrastructureType, layers: LayerState, filters: AtlasFilters) {
  if (!matchesInfrastructureType(filters, category)) return false;
  const layerByCategory: Partial<Record<InfrastructureType, AtlasLayerKey>> = {
    "power-plant": "powerPlants",
    substation: "substations",
    "data-center": "dataCenters",
    "price-node": "priceNodes",
    "grid-region": "countryStats",
    alert: "alerts"
  };
  const layerId = layerByCategory[category];
  return layerId ? layers[layerId] : true;
}

type AtlasLayerKey = keyof LayerState;

function demoCoordinate([longitude, latitude]: [number, number], index: number, hubIndex: number): [number, number] {
  const angle = (index * 137.5 + hubIndex * 31) * (Math.PI / 180);
  const ring = 0.45 + (index % 4) * 0.34 + Math.floor(index / 6) * 0.18;
  const longitudeScale = latitude > 50 ? 1.35 : latitude < -25 ? 1.2 : 1;
  return [
    Math.round((longitude + Math.cos(angle) * ring * longitudeScale) * 1000) / 1000,
    Math.round((latitude + Math.sin(angle) * ring * 0.72) * 1000) / 1000
  ];
}

function offsetDomesticCorridor([longitude, latitude]: [number, number]): [number, number] {
  return [longitude + 5.8, latitude + (latitude > 0 ? -3.6 : 3.6)];
}

function buildArcCoordinates(from: [number, number], to: [number, number]): [number, number][] {
  const [fromLon, fromLat] = from;
  const [toLon, toLat] = to;
  const midLon = (fromLon + toLon) / 2;
  const midLat = (fromLat + toLat) / 2 + Math.min(9, Math.max(-9, Math.abs(toLon - fromLon) / 18));
  return [from, [midLon, midLat], to];
}

function demoCategoryLabel(category: InfrastructureType) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
          fill="none"
          filter="url(#atlas-land-glow)"
          stroke="#5eead4"
          strokeOpacity="0.055"
          strokeWidth="0.12"
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
  sources,
  densityMode
}: {
  sources: ReturnType<typeof buildMapSources>;
  densityMode: boolean;
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
      {densityMode
        ? sources.demoLines.features.map((feature) => {
            const points = feature.geometry.coordinates
              .map((coordinate) => projectToViewport([coordinate[0] ?? 0, coordinate[1] ?? 0]))
              .join(" ");
            const color = feature.properties?.corridorType === "interconnection" ? "#22d3ee" : "#34d399";
            return (
              <g key={String(feature.properties?.id)}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeOpacity="0.14"
                  strokeWidth="1.1"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeOpacity="0.42"
                  strokeWidth="0.22"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })
        : null}
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
      {densityMode
        ? sources.demoPoints.features.map((feature) => {
            const [x, y] = projectToViewport([feature.geometry.coordinates[0] ?? 0, feature.geometry.coordinates[1] ?? 0]);
            const category = feature.properties?.category ?? "power-plant";
            const color = infrastructureColors[category] ?? "#22d3ee";
            return <DemoMarker key={String(feature.properties?.id)} x={x} y={y} color={color} category={category} />;
          })
        : null}
      {sources.points.features.map((feature) => {
        const [x, y] = projectToViewport([feature.geometry.coordinates[0] ?? 0, feature.geometry.coordinates[1] ?? 0]);
        const category = feature.properties?.category ?? "power-plant";
        const color = infrastructureColors[category] ?? "#22d3ee";
        return <DemoMarker key={String(feature.properties?.id)} x={x} y={y} color={color} category={category} emphasis />;
      })}
    </svg>
  );
}

function DemoMarker({
  x,
  y,
  color,
  category,
  emphasis = false
}: {
  x: number;
  y: number;
  color: string;
  category: InfrastructureType;
  emphasis?: boolean;
}) {
  const radius = emphasis ? 0.36 : 0.22;
  const glow = emphasis ? 3.4 : 2.4;
  if (category === "substation") {
    return (
      <g filter="url(#atlas-glow)">
        <circle cx={x} cy={y} r={radius * glow} fill={color} fillOpacity="0.12" />
        <rect
          x={x - radius}
          y={y - radius}
          width={radius * 2}
          height={radius * 2}
          fill={color}
          fillOpacity={emphasis ? "0.95" : "0.78"}
          stroke="#020617"
          strokeWidth="0.05"
          transform={`rotate(45 ${x} ${y})`}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }

  if (category === "data-center") {
    return (
      <g filter="url(#atlas-glow)">
        <circle cx={x} cy={y} r={radius * glow} fill={color} fillOpacity="0.12" />
        <rect
          x={x - radius * 1.05}
          y={y - radius * 0.8}
          width={radius * 2.1}
          height={radius * 1.6}
          rx="0.08"
          fill={color}
          fillOpacity={emphasis ? "0.95" : "0.78"}
          stroke="#020617"
          strokeWidth="0.05"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }

  if (category === "alert") {
    return (
      <g filter="url(#atlas-glow)">
        <circle cx={x} cy={y} r={radius * glow} fill={color} fillOpacity="0.14" />
        <path
          d={`M ${x} ${y - radius * 1.3} L ${x + radius * 1.25} ${y + radius} L ${x - radius * 1.25} ${y + radius} Z`}
          fill={color}
          fillOpacity={emphasis ? "0.95" : "0.8"}
          stroke="#020617"
          strokeWidth="0.05"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }

  return (
    <g filter="url(#atlas-glow)">
      <circle cx={x} cy={y} r={radius * glow} fill={color} fillOpacity="0.12" />
      <circle cx={x} cy={y} r={radius * 1.55} fill={color} fillOpacity="0.22" />
      <circle cx={x} cy={y} r={radius} fill={color} fillOpacity={emphasis ? "0.95" : "0.82"} />
    </g>
  );
}

function projectToViewport([longitude, latitude]: [number, number]) {
  const x = ((longitude + 180) / 360) * 100;
  const boundedLat = Math.max(-85, Math.min(85, latitude));
  const radians = (boundedLat * Math.PI) / 180;
  const mercatorY = (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2;
  return [x, mercatorY * 100] as const;
}
