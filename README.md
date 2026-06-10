# TerraGrid Atlas

**Global grid infrastructure interface**

> Explore sample electricity infrastructure data through maps, dashboards, and comparison views.

GitHub: [BeauDevCode/terragrid-atlas](https://github.com/BeauDevCode/terragrid-atlas)

Live demo: Not published yet. Run the local setup below to review the app.

TerraGrid Atlas is a Next.js web app for exploring electricity and energy infrastructure through an interactive map, infrastructure explorer, and country-level analytics dashboards.

I built TerraGrid Atlas because energy infrastructure data is often fragmented, paywalled, or difficult to explore. The project shows how a practical TypeScript interface can organize sample infrastructure records into maps, filters, dashboards, and transparent methodology notes.

## What This Project Demonstrates

- A typed Next.js App Router interface with atlas, dashboard, explorer, compare, and methodology pages.
- Map-focused UI state for layers, filters, selected countries, hovered assets, and detail panels.
- Reusable components for charts, metric cards, empty states, map controls, and data tables.
- Adapter boundaries around local JSON files so future live data sources can be added without rewriting the UI.
- Documentation discipline: screenshots, data labels, validation commands, limitations, and a realistic roadmap.

## Features

- Full-screen global MapLibre atlas with a dark basemap
- Layer toggles for power plants, transmission lines, substations, data centers, grid regions, price nodes, interconnections, alerts, and country statistics
- Search and filters for country, continent, fuel type, capacity range, voltage class, infrastructure type, status, operator, year, and data mode
- Clustered infrastructure points, hover tooltips, click popups, country zooming, and density mode
- Clearly labeled sample density layer that adds visual demo infrastructure signals without claiming verified live coverage
- Collapsible intelligence dashboard with global and selected-country metrics
- Country dashboards with generation mix, fuel capacity, infrastructure counts, load history, alerts, operators, and map preview
- Infrastructure explorer with sorting, filtering, pagination, row detail drawer, and CSV export
- 2-4 country comparison dashboard
- Transparent methodology page explaining sample, estimated, and live-ready data modes

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-inspired local components
- MapLibre GL JS
- Recharts
- lucide-react
- Local JSON sample datasets
- Adapter-ready data architecture
- Vercel deployment path

## Architecture

```text
app/
  atlas/                 Interactive global atlas
  compare/               Country comparison dashboard
  dashboard/[country]/   Region / country intelligence view
  explorer/              Searchable infrastructure table
  methodology/           About and data methodology
components/
  atlas/                 Atlas workspace state
  charts/                Recharts visualizations
  compare/               Comparison dashboard
  dashboard/             Country stats and map preview
  explorer/              Table and detail drawer
  map/                   MapLibre map, layers, filters, dashboard
  ui/                    shadcn-style primitives
data/sample/             Local JSON datasets
lib/data/                Types, adapters, constants, aggregations
```

UI state lives in the atlas, map, explorer, and compare components. The current app keeps state client-side because the dataset is local and small; the data adapter layer is the boundary for future API, database, or live-feed integrations.

## Data Model

The project defines typed interfaces for:

- `PowerPlant`
- `TransmissionLine`
- `Substation`
- `DataCenter`
- `CountryEnergyStat`
- `GridRegion`
- `PriceNode`
- `GridAlert`
- `LiveMetric`
- `GenerationMix`

The MVP uses local JSON data, but all datasets are loaded through adapter boundaries in `lib/data/adapters.ts`. This keeps the app ready for future live sources without rewriting the UI.

## Map Layers

- Power Plants
- Transmission Lines
- Substations
- Data Centers
- Grid Regions / Operators
- Price Nodes
- Interconnection Corridors
- Alerts / Outages
- Country Energy Stats

## Public Data Sources to Support

The adapter roadmap is structured for sources such as:

- OpenStreetMap / Overpass
- Global Power Plant Database
- World Bank, IEA, and Ember-style country energy metrics
- ENTSO-E-style load, price, and market data where available
- EIA-style fuel mix and generation data where available
- Public data center and transmission geometry datasets

## Data Notes

This repository ships with realistic sample and estimated records for:

- United States
- Canada
- Brazil
- United Kingdom
- Germany
- France
- India
- China
- Japan
- Australia
- South Africa
- Nigeria
- Saudi Arabia

Records are labeled as `sample`, `estimated`, or `live`. The current MVP intentionally runs without a required database or paid API service.

The global atlas also includes a clearly labeled sample density layer. Those additional visual density points and corridors are generated presentation/demo signals used to make the atlas readable at global zoom. They are not verified live infrastructure assets.

This scope is intentional: the repo demonstrates interface design, data modeling, and reviewable visualization patterns before adding external providers. It should not be treated as a complete infrastructure database.

## Screenshots

Static screenshots are available for the main review pages. A GIF walkthrough is not recorded yet.

### Landing Page

![Landing Page](screenshots/landing.png)

### Global Atlas

![Global Atlas](screenshots/atlas.png)

### Country Dashboard

![Country Dashboard](screenshots/dashboard-us.png)

### Infrastructure Explorer

![Infrastructure Explorer](screenshots/explorer.png)

### Compare Countries

![Compare Countries](screenshots/compare.png)

### Methodology

![Methodology](screenshots/methodology.png)

## Pages

- `/` - Landing page
- `/atlas` - Full-screen global infrastructure atlas
- `/dashboard/US` - Example country dashboard
- `/explorer` - Infrastructure record explorer
- `/compare` - Country comparison workspace
- `/methodology` - Data methodology and limitations

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Then open [http://localhost:3000](http://localhost:3000) and review:

- `/` - landing page
- `/atlas` - global infrastructure atlas
- `/dashboard/US` - example country dashboard
- `/explorer` - infrastructure record explorer
- `/compare` - country comparison workspace
- `/methodology` - data methodology and limitations

Verified from a fresh clone with Node/npm on Windows: dependency install, typecheck, lint, production build, and HTTP 200 smoke checks for the pages above. On Windows systems where PowerShell blocks `npm.ps1`, run the same commands with `npm.cmd`.

`npm run lint` currently passes through `next lint`, but Next.js reports that command as deprecated before Next.js 16. Migrating the script to the ESLint CLI is a small follow-up.

## Production Build

```bash
npm run build
npm run start
```

## Vercel Deployment

The app is ready for Vercel. To deploy manually:

```bash
npx vercel@latest login
npx vercel@latest --prod
```

Or import the GitHub repository from the Vercel dashboard:

1. Open [https://vercel.com/new](https://vercel.com/new)
2. Import `BeauDevCode/terragrid-atlas`
3. Keep the detected Next.js settings
4. Deploy

## Roadmap

- Deploy a public demo and add the live URL to this README.
- Add live provider adapters for regional load, price, outage, and generation feeds.
- Add tests for data helpers, filters, and table behavior.
- Improve small-screen map controls and dashboard layout.
- Add source-confidence notes and richer methodology exports.

## Limitations

- The included dataset is representative, not exhaustive.
- Transmission line geometries are simplified.
- Some data center loads and market prices are estimated.
- The sample density layer is visual demo data, not verified facility data.
- There is no authentication, saved workspace persistence, or live provider sync yet.
- This app is for research exploration, not operational dispatch or emergency response.

## Suggested Repo Metadata

- Repo name: `terragrid-atlas`
- Description: `A global interactive atlas for exploring power plants, substations, transmission, data centers, and grid intelligence.`
- Topics: `nextjs`, `typescript`, `tailwindcss`, `maplibre`, `energy`, `infrastructure`, `power-grid`, `geospatial`, `recharts`, `open-data`
