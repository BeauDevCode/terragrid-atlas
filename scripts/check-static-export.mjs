import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const output = join(process.cwd(), "out");
const routes = ["", "atlas", "explorer", "compare", "methodology", "dashboard/US"];

for (const route of routes) {
  const page = join(output, route, "index.html");
  assert.ok(existsSync(page), `Missing static page: ${page}`);
}

const home = readFileSync(join(output, "index.html"), "utf8");
assert.match(home, /\/terragrid-atlas\/_next\//, "Static assets must use the GitHub Pages base path");
assert.match(home, /\/terragrid-atlas\/atlas\//, "Navigation must use the GitHub Pages base path");

const media = join(output, "_next", "static", "media");
assert.ok(
  existsSync(media) && readdirSync(media).some((file) => file.startsWith("maplibre-gl-worker") && file.endsWith(".mjs")),
  "MapLibre worker must be included in the static export"
);

console.log(`Static export includes ${routes.length} review routes, prefixed assets, and the MapLibre worker.`);
