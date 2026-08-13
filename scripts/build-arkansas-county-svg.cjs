/**
 * Rebuilds `src/data/kelly-county-visits/arkansas-county-svg-paths.ts`
 * from US Atlas counties-10m TopoJSON (Arkansas FIPS 05xxx only).
 *
 * Source file: pass path as argv[2], or default to the last fetched atlas dump.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_TOPO =
  "C:/Users/User/.cursor/projects/h-SOSWebsite/agent-tools/51399ea4-beb4-4cd0-9020-51b858e32081.txt";
const OUT = path.join(ROOT, "src/data/kelly-county-visits/arkansas-county-svg-paths.ts");

const FIPS_TO_NAME = {
  "05001": "Arkansas",
  "05003": "Ashley",
  "05005": "Baxter",
  "05007": "Benton",
  "05009": "Boone",
  "05011": "Bradley",
  "05013": "Calhoun",
  "05015": "Carroll",
  "05017": "Chicot",
  "05019": "Clark",
  "05021": "Clay",
  "05023": "Cleburne",
  "05025": "Cleveland",
  "05027": "Columbia",
  "05029": "Conway",
  "05031": "Craighead",
  "05033": "Crawford",
  "05035": "Crittenden",
  "05037": "Cross",
  "05039": "Dallas",
  "05041": "Desha",
  "05043": "Drew",
  "05045": "Faulkner",
  "05047": "Franklin",
  "05049": "Fulton",
  "05051": "Garland",
  "05053": "Grant",
  "05055": "Greene",
  "05057": "Hempstead",
  "05059": "Hot Spring",
  "05061": "Howard",
  "05063": "Independence",
  "05065": "Izard",
  "05067": "Jackson",
  "05069": "Jefferson",
  "05071": "Johnson",
  "05073": "Lafayette",
  "05075": "Lawrence",
  "05077": "Lee",
  "05079": "Lincoln",
  "05081": "Little River",
  "05083": "Logan",
  "05085": "Lonoke",
  "05087": "Madison",
  "05089": "Marion",
  "05091": "Miller",
  "05093": "Mississippi",
  "05095": "Monroe",
  "05097": "Montgomery",
  "05099": "Nevada",
  "05101": "Newton",
  "05103": "Ouachita",
  "05105": "Perry",
  "05107": "Phillips",
  "05109": "Pike",
  "05111": "Poinsett",
  "05113": "Polk",
  "05115": "Pope",
  "05117": "Prairie",
  "05119": "Pulaski",
  "05121": "Randolph",
  "05123": "St. Francis",
  "05125": "Saline",
  "05127": "Scott",
  "05129": "Searcy",
  "05131": "Sebastian",
  "05133": "Sevier",
  "05135": "Sharp",
  "05137": "Stone",
  "05139": "Union",
  "05141": "Van Buren",
  "05143": "Washington",
  "05145": "White",
  "05147": "Woodruff",
  "05149": "Yell",
};

function countyKey(name) {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function decodeArc(raw, transform) {
  let x = 0;
  let y = 0;
  const out = [];
  for (const [dx, dy] of raw) {
    x += dx;
    y += dy;
    out.push([x * transform.scale[0] + transform.translate[0], y * transform.scale[1] + transform.translate[1]]);
  }
  return out;
}

function stitchRing(arcIdxs, decoded) {
  const coords = [];
  for (const idx of arcIdxs) {
    const reverse = idx < 0;
    const pts = decoded[reverse ? ~idx : idx];
    const seq = reverse ? pts.slice().reverse() : pts;
    const start = coords.length ? 1 : 0;
    for (let i = start; i < seq.length; i++) coords.push(seq[i]);
  }
  return coords;
}

function geometryRings(geom, decoded) {
  if (geom.type === "Polygon") {
    return geom.arcs.map((ring) => stitchRing(ring, decoded));
  }
  if (geom.type === "MultiPolygon") {
    return geom.arcs.flatMap((poly) => poly.map((ring) => stitchRing(ring, decoded)));
  }
  return [];
}

function project(lon, lat, origin) {
  const x = (lon - origin.lon0) * origin.cos;
  const y = origin.lat0 - lat;
  return [x, y];
}

function ringToPath(ring, origin, scale, pad) {
  if (ring.length < 2) return "";
  const pts = ring.map(([lon, lat]) => {
    const [x, y] = project(lon, lat, origin);
    const sx = pad + (x - origin.minX) * scale;
    const sy = pad + (y - origin.minY) * scale;
    return `${sx.toFixed(1)} ${sy.toFixed(1)}`;
  });
  return `M${pts.join("L")}Z`;
}

function main() {
  const topoPath = process.argv[2] || DEFAULT_TOPO;
  const topo = JSON.parse(fs.readFileSync(topoPath, "utf8"));
  const decoded = topo.arcs.map((arc) => decodeArc(arc, topo.transform));
  const geoms = topo.objects.counties.geometries.filter((g) => String(g.id).padStart(5, "0").startsWith("05"));
  if (geoms.length !== 75) {
    throw new Error(`Expected 75 Arkansas counties, got ${geoms.length}`);
  }

  const lon0 = -92.2;
  const lat0 = 34.8;
  const origin = { lon0, lat0, cos: Math.cos((lat0 * Math.PI) / 180), minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  const counties = geoms.map((g) => {
    const fips = String(g.id).padStart(5, "0");
    const name = FIPS_TO_NAME[fips];
    if (!name) throw new Error(`Unknown Arkansas FIPS ${fips}`);
    const rings = geometryRings(g, decoded);
    return { fips, name, key: countyKey(name), rings };
  });

  for (const c of counties) {
    for (const ring of c.rings) {
      for (const [lon, lat] of ring) {
        const [x, y] = project(lon, lat, origin);
        if (x < origin.minX) origin.minX = x;
        if (y < origin.minY) origin.minY = y;
        if (x > origin.maxX) origin.maxX = x;
        if (y > origin.maxY) origin.maxY = y;
      }
    }
  }

  const pad = 8;
  const width = 640;
  const height = 560;
  const scale = Math.min((width - pad * 2) / (origin.maxX - origin.minX), (height - pad * 2) / (origin.maxY - origin.minY));
  const vbW = Math.ceil(pad * 2 + (origin.maxX - origin.minX) * scale);
  const vbH = Math.ceil(pad * 2 + (origin.maxY - origin.minY) * scale);

  counties.sort((a, b) => a.name.localeCompare(b.name));

  const rows = counties.map((c) => {
    const d = c.rings.map((ring) => ringToPath(ring, origin, scale, pad)).join("");
    return { key: c.key, name: c.name, fips: c.fips, d };
  });

  const missing = Object.keys(FIPS_TO_NAME).filter((fips) => !rows.some((r) => r.fips === fips));
  if (missing.length) throw new Error(`Missing FIPS: ${missing.join(",")}`);

  const body = rows
    .map(
      (r) =>
        `  { key: ${JSON.stringify(r.key)}, name: ${JSON.stringify(r.name)}, fips: ${JSON.stringify(r.fips)}, d: ${JSON.stringify(r.d)} }`,
    )
    .join(",\n");

  const file = `/**
 * Arkansas county SVG paths for the public Events map.
 * Generated by scripts/build-arkansas-county-svg.cjs from US Atlas counties-10m.
 * Canonical keys match src/lib/events/county-key.ts (hot-spring, st-francis).
 */
export type ArkansasCountySvgPath = {
  key: string;
  name: string;
  fips: string;
  d: string;
};

export const ARKANSAS_COUNTY_SVG_VIEWBOX = "0 0 ${vbW} ${vbH}";

export const ARKANSAS_COUNTY_SVG_PATHS: readonly ArkansasCountySvgPath[] = [
${body},
];
`;

  fs.writeFileSync(OUT, file);
  console.log(`Wrote ${rows.length} counties to ${path.relative(ROOT, OUT)} viewBox=${vbW}x${vbH}`);
}

main();
