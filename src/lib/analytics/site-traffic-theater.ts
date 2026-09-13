import type { SiteTrafficSnapshot } from "@/lib/analytics/site-traffic-aggregate";
import type { VisitorEvent, VisitorProfile } from "@/lib/analytics/site-traffic-explorer";
import type { SiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";
import { classifyContentSection } from "@/lib/analytics/visitor-signals";

export type FlightIntent = "captured" | "joining" | "giving" | "local" | "reading" | "flyby";

export type FlightBody = {
  id: string;
  label: string;
  callsign: string;
  seed: number;
  x: number;
  y: number;
  r: number;
  intent: FlightIntent;
  capture: number;
  city: string | null;
  live: boolean;
  warm: boolean;
  converted: boolean;
  formStarted: boolean;
  pageViews: number;
  minutes: number;
  lastPath: string;
  source: string;
  firstAt: string;
  lastAt: string;
  tours: string[];
  timeline: VisitorEvent[];
  intakeHref: string | null;
};

export type DirectorLine = {
  at: string;
  code: "LOCK" | "CAPTURE" | "FLARE" | "LEAK" | "VECTOR" | "PULSE" | "HOLD";
  text: string;
};

export type GoItem = {
  id: string;
  label: string;
  go: boolean;
  note: string;
};

export type TheaterCity = {
  name: string;
  x: number;
  y: number;
  hits: number;
};

export type FlightTheater = {
  bodies: FlightBody[];
  cities: TheaterCity[];
  outline: string;
  hq: { x: number; y: number };
  director: DirectorLine[];
  readiness: GoItem[];
  intents: Array<{ intent: FlightIntent; count: number }>;
  spanStart: string;
  spanEnd: string;
  captured: number;
  joining: number;
  live: number;
  meanCapture: number;
};

const WEST = -94.72;
const EAST = -89.64;
const SOUTH = 33.0;
const NORTH = 36.52;
const WIDTH = 1000;
const HEIGHT = 720;

type GeoCity = { name: string; lat: number; lon: number; aliases: string[] };

const ARKANSAS_CITIES: GeoCity[] = [
  { name: "Little Rock", lat: 34.7465, lon: -92.2896, aliases: ["little rock", "lr"] },
  { name: "North Little Rock", lat: 34.7695, lon: -92.2671, aliases: ["north little rock", "nlr"] },
  { name: "Fayetteville", lat: 36.0626, lon: -94.1574, aliases: ["fayetteville"] },
  { name: "Springdale", lat: 36.1867, lon: -94.1288, aliases: ["springdale"] },
  { name: "Rogers", lat: 36.332, lon: -94.1185, aliases: ["rogers"] },
  { name: "Bentonville", lat: 36.3729, lon: -94.2088, aliases: ["bentonville"] },
  { name: "Fort Smith", lat: 35.3859, lon: -94.3985, aliases: ["fort smith"] },
  { name: "Jonesboro", lat: 35.8423, lon: -90.7043, aliases: ["jonesboro"] },
  { name: "Conway", lat: 35.0887, lon: -92.4421, aliases: ["conway"] },
  { name: "Hot Springs", lat: 34.5037, lon: -93.0552, aliases: ["hot springs"] },
  { name: "Pine Bluff", lat: 34.2284, lon: -92.0032, aliases: ["pine bluff"] },
  { name: "Searcy", lat: 35.2506, lon: -91.7363, aliases: ["searcy"] },
  { name: "Russellville", lat: 35.2784, lon: -93.1338, aliases: ["russellville"] },
  { name: "Texarkana", lat: 33.4418, lon: -94.0377, aliases: ["texarkana"] },
  { name: "West Memphis", lat: 35.1465, lon: -90.1845, aliases: ["west memphis"] },
  { name: "El Dorado", lat: 33.2076, lon: -92.6663, aliases: ["el dorado"] },
  { name: "Mountain Home", lat: 36.3353, lon: -92.3851, aliases: ["mountain home"] },
  { name: "Harrison", lat: 36.2298, lon: -93.1077, aliases: ["harrison"] },
  { name: "Batesville", lat: 35.7698, lon: -91.6409, aliases: ["batesville"] },
  { name: "Paragould", lat: 36.0584, lon: -90.4973, aliases: ["paragould"] },
  { name: "Jacksonville", lat: 34.8662, lon: -92.1101, aliases: ["jacksonville"] },
  { name: "Cabot", lat: 34.9745, lon: -92.0165, aliases: ["cabot"] },
  { name: "Benton", lat: 34.5645, lon: -92.5868, aliases: ["benton"] },
  { name: "Sherwood", lat: 34.8151, lon: -92.2243, aliases: ["sherwood"] },
  { name: "Bryant", lat: 34.5959, lon: -92.489, aliases: ["bryant"] },
  { name: "Van Buren", lat: 35.4368, lon: -94.3483, aliases: ["van buren"] },
  { name: "Siloam Springs", lat: 36.1881, lon: -94.5405, aliases: ["siloam springs"] },
];

const OUTLINE: Array<[number, number]> = [
  [36.5, -94.62],
  [36.5, -91.64],
  [36.3, -90.37],
  [36.0, -89.73],
  [35.0, -90.2],
  [34.0, -90.9],
  [33.02, -91.16],
  [33.02, -94.04],
  [33.62, -94.18],
  [35.0, -94.48],
  [36.0, -94.62],
];

const INTENT_ORDER: FlightIntent[] = ["captured", "joining", "giving", "local", "reading", "flyby"];

export function projectArkansas(lat: number, lon: number): { x: number; y: number } {
  const x = 80 + ((lon - WEST) / (EAST - WEST)) * 840;
  const y = 50 + (1 - (lat - SOUTH) / (NORTH - SOUTH)) * 600;
  return { x, y };
}

export function outlinePath(): string {
  return OUTLINE.map((pair, index) => {
    const point = projectArkansas(pair[0], pair[1]);
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }).join(" ") + " Z";
}

function normalizePlace(raw: string | null | undefined): string {
  return (raw ?? "")
    .toLowerCase()
    .replace(/,?\s*(ar|arkansas)\s*$/i, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchArkansasCity(raw: string | null | undefined): GeoCity | null {
  const place = normalizePlace(raw);
  if (!place) return null;
  return (
    ARKANSAS_CITIES.find((city) => city.aliases.some((alias) => place === alias || place.startsWith(alias))) ?? null
  );
}

export function captureScore(row: VisitorProfile): number {
  if (row.converted) return 100;
  let score = 0;
  score += Math.min(32, row.pageViews * 7);
  score += Math.min(18, row.totalMinutes * 3);
  if (row.formStarted) score += 22;
  if (row.engaged) score += 8;
  if ((row.maxScroll ?? 0) >= 50) score += 8;
  if (row.sessions > 1) score += 10;
  if (row.cities.length > 0) score += 4;
  if (row.outbounds > 0) score += 6;
  return Math.min(96, Math.round(score));
}

function lastPathOf(row: VisitorProfile): string {
  const tour = row.tours[row.tours.length - 1] ?? "";
  const parts = tour.split(" → ").map((part) => part.trim()).filter(Boolean);
  if (parts.length) return parts[parts.length - 1] ?? "/";
  const page = [...row.timeline].reverse().find((event) => event.path);
  return page?.path || "/";
}

export function classifyIntent(row: VisitorProfile): FlightIntent {
  const path = lastPathOf(row);
  const section = classifyContentSection(path);
  if (row.converted) return "captured";
  if (row.formStarted || section === "get_involved" || section === "voter_registration") return "joining";
  if (section === "donate" || row.outbounds > 0) return "giving";
  if (section === "counties" || (row.cities.length > 0 && row.pageViews >= 2)) return "local";
  if (row.pageViews >= 3 || row.engaged) return "reading";
  return "flyby";
}

function placeBody(row: VisitorProfile, city: GeoCity | null): { x: number; y: number } {
  if (city) {
    const home = projectArkansas(city.lat, city.lon);
    const angle = ((row.seed % 360) * Math.PI) / 180;
    const radius = 16 + (row.seed % 28);
    return { x: home.x + Math.cos(angle) * radius, y: home.y + Math.sin(angle) * radius };
  }
  const ring = 0.42 + ((row.seed % 80) / 200);
  const angle = ((row.seed % 360) * Math.PI) / 180;
  return {
    x: WIDTH / 2 + Math.cos(angle) * 340 * ring,
    y: HEIGHT / 2 + Math.sin(angle) * 250 * ring,
  };
}

function bodyRadius(row: VisitorProfile, capture: number): number {
  return 4 + Math.min(10, row.pageViews * 0.7 + capture / 22);
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sourceOf(row: VisitorProfile): string {
  return row.sources[0] || "Direct / unknown";
}

export function isBodyVisible(body: FlightBody, atMs: number): boolean {
  const first = Date.parse(body.firstAt);
  const last = Date.parse(body.lastAt);
  if (!Number.isFinite(first) || !Number.isFinite(last)) return false;
  const linger = body.converted ? 90 * 60 * 1000 : 25 * 60 * 1000;
  return first <= atMs && atMs <= last + linger;
}

export function buildFlightTheater(
  snapshot: SiteTrafficSnapshot,
  intel: SiteTrafficIntelligence,
  now = Date.now(),
): FlightTheater {
  const hq = projectArkansas(34.7465, -92.2896);
  const bodies: FlightBody[] = snapshot.people.map((row) => {
    const cityName = row.cities[0] ?? null;
    const geo = matchArkansasCity(cityName);
    const point = placeBody(row, geo);
    const capture = captureScore(row);
    const lastMs = Date.parse(row.lastAt);
    return {
      id: `b${row.seed}`,
      label: row.label,
      callsign: row.neighborName || row.label,
      seed: row.seed,
      x: point.x,
      y: point.y,
      r: bodyRadius(row, capture),
      intent: classifyIntent(row),
      capture,
      city: cityName,
      live: Number.isFinite(lastMs) && now - lastMs <= 15 * 60 * 1000,
      warm: Number.isFinite(lastMs) && now - lastMs <= 60 * 60 * 1000,
      converted: row.converted,
      formStarted: row.formStarted,
      pageViews: row.pageViews,
      minutes: row.totalMinutes,
      lastPath: lastPathOf(row),
      source: sourceOf(row),
      firstAt: row.firstAt,
      lastAt: row.lastAt,
      tours: row.tours.slice(-4),
      timeline: row.timeline.slice(-12),
      intakeHref: row.intakeHref,
    };
  });

  const cityHits = new Map<string, TheaterCity>();
  for (const row of snapshot.cities) {
    const geo = matchArkansasCity(row.label);
    if (!geo) continue;
    const point = projectArkansas(geo.lat, geo.lon);
    const prior = cityHits.get(geo.name);
    cityHits.set(geo.name, {
      name: geo.name,
      x: point.x,
      y: point.y,
      hits: (prior?.hits ?? 0) + row.hits,
    });
  }
  for (const body of bodies) {
    const geo = matchArkansasCity(body.city);
    if (!geo || cityHits.has(geo.name)) continue;
    const point = projectArkansas(geo.lat, geo.lon);
    cityHits.set(geo.name, { name: geo.name, x: point.x, y: point.y, hits: 1 });
  }

  const intentCounts = new Map<FlightIntent, number>();
  for (const intent of INTENT_ORDER) intentCounts.set(intent, 0);
  for (const body of bodies) {
    intentCounts.set(body.intent, (intentCounts.get(body.intent) ?? 0) + 1);
  }

  const firstIso = bodies.reduce((best, body) => (body.firstAt < best ? body.firstAt : best), bodies[0]?.firstAt ?? new Date(now).toISOString());
  const lastIso = bodies.reduce((best, body) => (body.lastAt > best ? body.lastAt : best), bodies[0]?.lastAt ?? new Date(now).toISOString());

  const director = buildDirector(snapshot, intel, bodies, now);
  const captured = bodies.filter((body) => body.converted).length;
  const joining = bodies.filter((body) => body.intent === "joining").length;
  const live = bodies.filter((body) => body.live).length;
  const meanCapture = bodies.length
    ? Math.round(bodies.reduce((sum, body) => sum + body.capture, 0) / bodies.length)
    : 0;

  return {
    bodies,
    cities: [...cityHits.values()].sort((a, b) => b.hits - a.hits),
    outline: outlinePath(),
    hq,
    director,
    readiness: buildReadiness(snapshot, intel, bodies),
    intents: INTENT_ORDER.map((intent) => ({ intent, count: intentCounts.get(intent) ?? 0 })),
    spanStart: firstIso,
    spanEnd: lastIso,
    captured,
    joining,
    live,
    meanCapture,
  };
}

function buildReadiness(snapshot: SiteTrafficSnapshot, intel: SiteTrafficIntelligence, bodies: FlightBody[]): GoItem[] {
  const recorderOn = snapshot.pageViews > 0;
  return [
    {
      id: "recorder",
      label: "Recorder",
      go: recorderOn,
      note: recorderOn ? `${snapshot.pageViews} public hits in window` : "No public hits stored in this window",
    },
    {
      id: "live",
      label: "Live traffic",
      go: snapshot.realtime.active15 > 0,
      note: snapshot.realtime.active15 > 0
        ? `${snapshot.realtime.active15} active in 15 min`
        : "Quiet in the last 15 minutes",
    },
    {
      id: "geo",
      label: "City lock",
      go: snapshot.cities.length > 0,
      note: snapshot.cities[0] ? snapshot.cities[0].label : "Waiting for a city stamp",
    },
    {
      id: "capture",
      label: "Capture",
      go: snapshot.formCompletes > 0,
      note: snapshot.formCompletes > 0
        ? `${snapshot.formCompletes} form${snapshot.formCompletes === 1 ? "" : "s"} finished`
        : snapshot.formStarts > 0
          ? `${snapshot.formStarts} form start${snapshot.formStarts === 1 ? "" : "s"}, no finish yet`
          : "No public forms finished",
    },
    {
      id: "queue",
      label: "Queue",
      go: bodies.some((body) => Boolean(body.intakeHref)),
      note: bodies.some((body) => Boolean(body.intakeHref))
        ? "Named neighbor is in the intake queue"
        : "Intake opens after a form finish",
    },
    {
      id: "mood",
      label: "Health",
      go: intel.mood === "strong" || intel.mood === "steady",
      note: `Desk mood ${intel.mood} · score ${intel.healthScore}`,
    },
  ];
}

function buildDirector(
  snapshot: SiteTrafficSnapshot,
  intel: SiteTrafficIntelligence,
  bodies: FlightBody[],
  now: number,
): DirectorLine[] {
  const lines: DirectorLine[] = [];
  const stamp = (iso: string): string => formatClock(iso);

  for (const body of bodies.filter((row) => row.converted).slice(0, 6)) {
    lines.push({
      at: body.lastAt,
      code: "CAPTURE",
      text: `${stamp(body.lastAt)} · ${body.callsign}${body.city ? ` · ${body.city}` : ""} · form finished · intake armed`,
    });
  }

  for (const body of bodies
    .filter((row) => row.live && !row.converted)
    .sort((a, b) => b.capture - a.capture)
    .slice(0, 8)) {
    lines.push({
      at: body.lastAt,
      code: body.formStarted ? "LOCK" : "PULSE",
      text: `${stamp(body.lastAt)} · ${body.callsign}${body.city ? ` · ${body.city}` : ""} · ${body.lastPath} · capture ${body.capture}`,
    });
  }

  for (const city of snapshot.cities.slice(0, 4)) {
    if (city.hits < 3) continue;
    lines.push({
      at: new Date(now).toISOString(),
      code: "FLARE",
      text: `${city.label} is clustering · ${city.hits} public hits this window`,
    });
  }

  for (const leak of intel.leaks.slice(0, 3)) {
    lines.push({
      at: new Date(now).toISOString(),
      code: "LEAK",
      text: `${leak.page} · ${leak.note}`,
    });
  }

  for (const move of snapshot.transitions.slice(0, 4)) {
    lines.push({
      at: new Date(now).toISOString(),
      code: "VECTOR",
      text: `${move.from} → ${move.to} · ${move.hits} times`,
    });
  }

  if (lines.length === 0) {
    lines.push({
      at: new Date(now).toISOString(),
      code: "HOLD",
      text: snapshot.pageViews === 0
        ? "Awaiting first neighbor. Share a live public page and the sky lights up."
        : "Bodies are on the board. Lock one to read the tour.",
    });
  }

  return lines
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 18);
}

export const INTENT_LABEL: Record<FlightIntent, string> = {
  captured: "Captured",
  joining: "Joining",
  giving: "Giving",
  local: "Local",
  reading: "Reading",
  flyby: "Flyby",
};

export const INTENT_COLOR: Record<FlightIntent, string> = {
  captured: "#f0c14b",
  joining: "#5ee0a8",
  giving: "#f59e8b",
  local: "#7dd3fc",
  reading: "#c4b5fd",
  flyby: "#8b95b8",
};
