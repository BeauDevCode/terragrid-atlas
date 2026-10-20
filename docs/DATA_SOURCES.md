# Data Sources and Limits

TerraGrid Atlas currently loads bundled JSON from [`data/sample/`](../data/sample/) through [`lib/data/adapters.ts`](../lib/data/adapters.ts). It does not fetch live infrastructure, price, load, or outage feeds. These files are for reviewing the interface and data model, not for verifying the present state of a grid.

| Data in the app | Current source | Limit |
| --- | --- | --- |
| Plants, substations, transmission corridors, data centers, regions, and alerts | Local sample records | Representative entries and simplified geometry; facility details are not a verified inventory. |
| Country energy totals, price nodes, and load snapshots | Local sample or estimated records | Values are demo signals; dates in the files are record labels, not proof of a current feed. |
| Extra map density points and corridors | Generated in `components/map/world-map.tsx` | Visual-only demo signals. They do not represent verified assets or appear as imported facilities. |
| Dark basemap | OpenFreeMap map tiles built from OpenStreetMap data | Provides geographic context only. It is not the source for the infrastructure records above and needs an internet connection. |

Records carry `source` and freshness fields such as `sample` or `estimated`. These labels describe how the demo presents a record; they are not an independent citation or quality guarantee. The current app has no provider sync, update schedule, deduplication pipeline, or historical validation.

Potential future adapters include OpenStreetMap/Overpass for mapped infrastructure, public power-plant datasets, and regional energy or market APIs where licenses and coverage allow. Those are plans, not connected sources. Each new provider should document its license, retrieval time, original record ID, geographic coverage, update cadence, and any transformations before its data is shown as live.

See the [methodology page](https://beaudevcode.github.io/terragrid-atlas/methodology/) for the in-app explanation. This project is for interface review and exploratory research, not operational dispatch or emergency response.
