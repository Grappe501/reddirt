/**
 * One-shot generator: public/maps/arkansas-counties.geojson ->
 * src/data/kelly-county-visits/arkansas-county-svg-paths.ts
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const geoPath = path.join(root, "public/maps/arkansas-counties.geojson");
const outPath = path.join(root, "src/data/kelly-county-visits/arkansas-county-svg-paths.ts");

const geo = JSON.parse(fs.readFileSync(geoPath, "utf8"));

function countyKey(name) {
  return String(name)
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ringToPairs(ring) {
  return ring.map((pt) => [Number(pt[0]), Number(pt[1])]);
}

function featureRings(feature) {
  const g = feature.geometry;
  if (!g) return [];
  if (g.type === "Polygon") return g.coordinates.map(ringToPairs);
  if (g.type === "MultiPolygon") return g.coordinates.flatMap((poly) => poly.map(ringToPairs));
  return [];
}

const allPts = [];
for (const f of geo.features) {
  for (const ring of featureRings(f)) allPts.push(...ring);
}
const lons = allPts.map((p) => p[0]);
const lats = allPts.map((p) => p[1]);
const west = Math.min(...lons);
const east = Math.max(...lons);
const south = Math.min(...lats);
const north = Math.max(...lats);
const WIDTH = 800;
const HEIGHT = Math.round(WIDTH * ((north - south) / (east - west)));
const PAD = 8;

function xy(lon, lat) {
  const x = PAD + ((lon - west) / (east - west)) * (WIDTH - PAD * 2);
  const y = PAD + ((north - lat) / (north - south)) * (HEIGHT - PAD * 2);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function ringToD(ring) {
  return ring
    .map((pt, i) => {
      const [x, y] = xy(pt[0], pt[1]);
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

const paths = geo.features
  .map((f) => {
    const name = f.properties.name;
    const rings = featureRings(f);
    const d = rings.map((r) => `${ringToD(r)} Z`).join(" ");
    return { key: countyKey(name), name, d };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const body = `/** Generated from public/maps/arkansas-counties.geojson. Do not edit by hand. */
export const ARKANSAS_COUNTY_SVG_VIEWBOX = "0 0 ${WIDTH} ${HEIGHT}";

export type ArkansasCountySvgPath = {
  key: string;
  name: string;
  d: string;
};

export const ARKANSAS_COUNTY_SVG_PATHS: ArkansasCountySvgPath[] = ${JSON.stringify(paths, null, 2)};
`;

fs.writeFileSync(outPath, body);
console.log("wrote", outPath, "counties", paths.length, "viewBox", WIDTH, HEIGHT);
