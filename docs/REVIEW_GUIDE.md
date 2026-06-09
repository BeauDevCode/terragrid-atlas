# Review Guide

This guide is for reviewers who want to understand the project quickly.

## What to review first

1. `README.md` for the product overview, screenshots, setup, verification commands, and limitations.
2. `app/atlas/` for the main interactive atlas route.
3. `app/dashboard/[country]/` for country-level dashboard behavior.
4. `app/explorer/` for the searchable infrastructure table.
5. `app/compare/` for the comparison workflow.
6. `components/map/` and `components/atlas/` for the map UI and state management.
7. `lib/data/` for types, adapters, constants, and aggregation logic.
8. `data/sample/` for local sample records and demo data boundaries.

## Validation commands

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Local development:

```bash
npm run dev
```

## Engineering signals

- Next.js App Router project organization.
- TypeScript types for infrastructure records and country metrics.
- MapLibre-based interactive map interface.
- Filterable explorer and comparison workflows.
- Local sample data kept behind adapter boundaries so future live sources can be added without rewriting the UI.
- README documents sample/estimated data instead of overstating coverage.

## Current limitations

- The included data is representative, not exhaustive.
- Some map geometries and records are simplified for demo readability.
- The project is not an operational grid tool.
- A production version would need live data providers, stronger source attribution, auth, persistence, and monitoring.
