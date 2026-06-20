/**
 * Build Top 100 city intelligence profiles — 10 enrichment dimensions per city.
 * Usage: npm run city-intelligence:build
 * Optional: GOOGLE_CIVIC_API_KEY in .env.local for live representative lookup at build time.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ARKANSAS_COUNTY_POPULATION_2020,
  ARKANSAS_TOP_100_CITIES,
  type ArkansasTop40City,
  type CityInfluenceTag,
} from "./strategic-plan/data/arkansas-top-40-cities";
import { loadWinTargets, readJson } from "./strategic-plan/lib/strategic-plan-shared";
import {
  CHAMBER_BY_SLUG,
  HIGH_SCHOOL_BY_SLUG,
  MEDIA_MARKET_BY_SLUG,
  defaultChamber,
  defaultHighSchool,
  defaultMediaMarket,
  defaultRotary,
  fieldValidatorTargets,
} from "./city-intelligence/seeds";

const ROOT = process.cwd();
const OUT_PATH = path.join(ROOT, "data/campaign-brain/city-intelligence-profiles.json");
const ISSUE_CLUSTERS_PATH = path.join(ROOT, "data/public-narrative/county-issue-clusters.json");
const SNAPSHOT_PATH = path.join(ROOT, "data/election-plan/election-plan-workbench.snapshot.json");
const BONUS_CITIES_PATH = path.join(ROOT, "data/campaign-brain/bonus-city-workbenches.source.json");
const WIKI_DIR = path.join(ROOT, "docs/ingested/county-wikipedia");

const CLUSTER_DESCRIPTIONS: Record<string, string> = {
  "central-metro": "Central Arkansas Metro — media, fundraising, volunteer production, Lane 2 recovery at scale.",
  nwa: "Northwest Arkansas — university pipeline, chamber networks, moderate Republican conversion.",
  "river-valley": "River Valley — regional media, clerk relationships, moderate GOP outreach.",
  "northeast-ridge": "Crowley's Ridge — persuasion, regional chambers, volunteer hubs.",
  "north-central-ozarks": "Ozarks — event-driven presence, retiree persuasion, fair circuit.",
  "hot-springs-ouachita": "Hot Springs / Ouachita — tourism, retiree persuasion, lake communities.",
  "delta-southeast": "Delta / Southeast — Democratic recovery, faith organizing, base turnout.",
  southwest: "Southwest Arkansas — chamber relationships, county seats, school registration.",
  "crittenden-memphis": "Crittenden / Memphis spillover — turnout growth, Delta base mobilization.",
};

const INFLUENCE_LABELS: Record<CityInfluenceTag, string> = {
  media: "media market reach",
  fundraising: "fundraising capacity",
  volunteers: "volunteer production",
  students: "student / campus pipeline",
  digital_reach: "digital amplification",
  business_leaders: "business leader access",
  chambers: "chamber network",
  moderate_republicans: "moderate Republican persuasion",
  turnout_growth: "turnout growth",
  democratic_recovery: "Democratic drop-off recovery",
  persuasion: "persuasion opportunity",
  regional_media: "regional media",
  political_influence: "statewide political influence",
};

function loadEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of [".env", ".env.local"]) {
    const p = path.join(ROOT, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const m = t.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[m[1]] = val;
    }
  }
  return out;
}

function countySlug(county: string): string {
  return `${county.toLowerCase().replace(/\s+/g, "-")}-county`;
}

function loadWikiExcerpt(registrySlug: string): { seat: string | null; excerpt: string | null } {
  const abs = path.join(WIKI_DIR, `${registrySlug}.md`);
  if (!existsSync(abs)) return { seat: null, excerpt: null };
  const raw = readFileSync(abs, "utf8");
  const seatMatch = raw.match(/\*\*County seats \(campaign directory\):\*\*\s*([^\n·]+)/i);
  const encyclopediaIdx = raw.indexOf("## Encyclopedia text");
  let excerpt: string | null = null;
  if (encyclopediaIdx >= 0) {
    const body = raw.slice(encyclopediaIdx).replace(/^## Encyclopedia text[^\n]*\n?/m, "");
    const trimmed = body.replace(/\n+/g, " ").trim();
    excerpt = trimmed.length > 0 ? trimmed.slice(0, 600) + (trimmed.length > 600 ? "…" : "") : null;
  }
  return { seat: seatMatch?.[1]?.trim() ?? null, excerpt };
}

type CivicOfficials = {
  stateHouse?: { name: string; district?: string; party?: string; phone?: string; url?: string };
  stateSenate?: { name: string; district?: string; party?: string; phone?: string; url?: string };
  usHouse?: { name: string; district?: string; party?: string; phone?: string; url?: string };
  mayor?: { name: string; title?: string; phone?: string; url?: string };
};

async function fetchGoogleCivic(cityName: string, apiKey: string): Promise<CivicOfficials | null> {
  try {
    const address = `${cityName}, Arkansas`;
    const u = new URL("https://www.googleapis.com/civicinfo/v2/representatives");
    u.searchParams.set("address", address);
    u.searchParams.set("key", apiKey);
    const res = await fetch(u.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as {
      offices?: Array<{ name: string; divisionId: string; officialIndices?: number[] }>;
      officials?: Array<{
        name: string;
        party?: string;
        phones?: string[];
        urls?: string[];
      }>;
    };
    const officials = data.officials ?? [];
    const offices = data.offices ?? [];
    const out: CivicOfficials = {};

    for (const office of offices) {
      const idx = office.officialIndices?.[0];
      if (idx === undefined) continue;
      const person = officials[idx];
      if (!person) continue;
      const on = office.name.toLowerCase();
      const entry = {
        name: person.name,
        party: person.party,
        phone: person.phones?.[0],
        url: person.urls?.[0],
        district: office.divisionId.split("/").pop(),
      };
      if (on.includes("arkansas") && on.includes("senate") && !on.includes("united states")) {
        out.stateSenate = entry;
      } else if (on.includes("arkansas") && (on.includes("house") || on.includes("representative")) && !on.includes("united states")) {
        out.stateHouse = entry;
      } else if (on.includes("united states") && on.includes("house")) {
        out.usHouse = entry;
      } else if (on.includes("mayor") || on.includes("city council")) {
        out.mayor = { name: person.name, title: office.name, phone: person.phones?.[0], url: person.urls?.[0] };
      }
    }
    return out;
  } catch {
    return null;
  }
}

function buildGeographicNarrative(
  city: (typeof ARKANSAS_TOP_100_CITIES)[number],
  sharePct: number,
  cluster: { name: string; description: string } | null,
): string {
  const countyPop = ARKANSAS_COUNTY_POPULATION_2020[city.county] ?? city.population2020;
  return [
    `${city.name} is a ${city.population2020.toLocaleString()}-resident city in ${city.county} County (2020 Census) — roughly ${sharePct.toFixed(1)}% of county population.`,
    cluster
      ? `Deployment cluster: ${cluster.name}. ${cluster.description}`
      : `${city.county} County field geography — coordinate with county playbook and cluster assignment.`,
    city.strategicRole,
  ].join(" ");
}

function buildHistoricalCulturalNarrative(
  city: (typeof ARKANSAS_TOP_100_CITIES)[number],
  wikiExcerpt: string | null,
): string {
  const tags = city.influenceTags.map((t) => INFLUENCE_LABELS[t]).join(", ");
  const wiki = wikiExcerpt
    ? `County context: ${wikiExcerpt}`
    : `${city.county} County cultural identity shapes how neighbors hear election messages — lead with service, not national noise.`;
  return [
    `${city.name} organizes around ${tags}.`,
    wiki,
    city.isTop10
      ? "Top-10 strategic city — field presence here signals statewide seriousness."
      : "Priority city in the Top 100 vote model — wins are built through repeat visits and local validators.",
  ].join(" ");
}

function buildSocioEconomicNarrative(topIssues: string[], county: string): string {
  if (topIssues.length === 0) {
    return `${county} County socio-economic profile pending Census/ACS ingest — inherit county demographics panel when DB row exists.`;
  }
  return `Neighbors name ${topIssues.join(", ")} as top local concerns (county issue cluster). Frame SOS competence around clerk support, registration access, and business services — not national abstraction.`;
}

function countStatuses(profile: { dimensions: Record<string, { status: string }> }) {
  const counts = { verified: 0, api: 0, inherited: 0, scaffold: 0 };
  for (const d of Object.values(profile.dimensions)) {
    const s = d.status as keyof typeof counts;
    if (s in counts) counts[s]++;
  }
  return counts;
}

function loadBonusCitiesForIntelBuild(): ArkansasTop40City[] {
  if (!existsSync(BONUS_CITIES_PATH)) return [];
  const file = JSON.parse(readFileSync(BONUS_CITIES_PATH, "utf8")) as {
    cities: Array<{
      slug: string;
      name: string;
      county: string;
      population2020?: number;
      influenceTags: CityInfluenceTag[];
      strategicRole: string;
      visitFrequency: ArkansasTop40City["visitFrequency"];
      isTop10: boolean;
      targetVotes?: number;
      baselineVote?: number;
      voteGain?: number;
      influenceCategory?: string;
    }>;
  };
  const topSlugs = new Set(ARKANSAS_TOP_100_CITIES.map((c) => c.slug));
  return file.cities
    .filter((c) => c.population2020 && !topSlugs.has(c.slug))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      county: c.county,
      population2020: c.population2020!,
      influenceTags: c.influenceTags,
      strategicRole: c.strategicRole,
      visitFrequency: c.visitFrequency,
      isTop10: c.isTop10,
    }));
}

function loadBonusCitySnapshotRows(): Map<
  string,
  { targetVotes: number; baselineVote: number; voteGain: number; influenceCategory: string }
> {
  if (!existsSync(BONUS_CITIES_PATH)) return new Map();
  const file = JSON.parse(readFileSync(BONUS_CITIES_PATH, "utf8")) as {
    cities: Array<{
      slug: string;
      targetVotes: number;
      baselineVote: number;
      voteGain: number;
      influenceCategory?: string;
    }>;
  };
  return new Map(
    file.cities.map((c) => [
      c.slug,
      {
        targetVotes: c.targetVotes,
        baselineVote: c.baselineVote,
        voteGain: c.voteGain,
        influenceCategory: c.influenceCategory ?? "Bonus immersion hub",
      },
    ]),
  );
}

async function main() {
  const env = loadEnv();
  const civicKey = env.GOOGLE_CIVIC_API_KEY;
  const scenario = loadWinTargets();
  const snapshot = readJson<{
    counties: Array<{ county: string; tier: string; primaryMission: string }>;
    execution: { clusters: Array<{ id: string; name: string; counties: string[] }> };
    cities: Array<{
      slug: string;
      targetVotes: number;
      baselineVote: number;
      voteGain: number;
      influenceCategory: string;
    }>;
  }>(SNAPSHOT_PATH);

  const issueRows =
    readJson<{ rows: Array<{ countySlug: string; topIssues: string[] }> }>(ISSUE_CLUSTERS_PATH)?.rows ?? [];

  const countyByName = new Map(snapshot?.counties.map((c) => [c.county, c]) ?? []);
  const citySnapshot = new Map(snapshot?.cities.map((c) => [c.slug, c]) ?? []);
  const bonusCitySnapshot = loadBonusCitySnapshotRows();
  const citiesToBuild = [...ARKANSAS_TOP_100_CITIES, ...loadBonusCitiesForIntelBuild()];
  const clusterByCounty = new Map<string, { id: string; name: string; description: string }>();
  for (const cl of snapshot?.execution.clusters ?? []) {
    for (const cn of cl.counties) {
      clusterByCounty.set(cn, {
        id: cl.id,
        name: cl.name,
        description: CLUSTER_DESCRIPTIONS[cl.id] ?? cl.name,
      });
    }
  }

  const cities: Record<string, unknown> = {};
  let civicFetched = 0;

  for (let i = 0; i < citiesToBuild.length; i++) {
    const city = citiesToBuild[i];
    const snap = citySnapshot.get(city.slug) ?? bonusCitySnapshot.get(city.slug);
    const countyRow = countyByName.get(city.county);
    const countyPop = ARKANSAS_COUNTY_POPULATION_2020[city.county] ?? city.population2020;
    const sharePct = (city.population2020 / countyPop) * 100;
    const winRow = scenario.counties.find((c) => c.county === city.county);
    const targetVotes = snap?.targetVotes ?? (winRow ? Math.round(winRow.targetVotes * (city.population2020 / countyPop)) : 0);
    const baselineVote = snap?.baselineVote ?? (winRow ? Math.round(winRow.baselineDemVotes * (city.population2020 / countyPop)) : 0);
    const voteGain = snap?.voteGain ?? Math.max(0, targetVotes - baselineVote);

    const cluster = clusterByCounty.get(city.county) ?? null;
    const issueRow = issueRows.find((r) => r.countySlug === countySlug(city.county));
    const wiki = loadWikiExcerpt(countySlug(city.county));
    const hs = defaultHighSchool(city.slug, city.name);
    const chamber = defaultChamber(city.slug, city.name);

    let civic: CivicOfficials | null = null;
    if (civicKey && civicKey.length > 3) {
      civic = await fetchGoogleCivic(city.name, civicKey);
      if (civic) civicFetched++;
      await new Promise((r) => setTimeout(r, 120));
    }

    const dimensions = {
      stateHouse: {
        label: "State House",
        name: civic?.stateHouse?.name ?? null,
        district: civic?.stateHouse?.district ?? null,
        party: civic?.stateHouse?.party ?? null,
        phone: civic?.stateHouse?.phone ?? null,
        url: civic?.stateHouse?.url ?? null,
        status: civic?.stateHouse ? ("api" as const) : ("scaffold" as const),
        source: civic?.stateHouse ? "Google Civic Information API (build-time)" : "Pending Google Civic or Arkleg lookup",
        note: civic?.stateHouse ? undefined : `Look up ${city.name} address in Arkleg district finder`,
      },
      stateSenate: {
        label: "State Senate",
        name: civic?.stateSenate?.name ?? null,
        district: civic?.stateSenate?.district ?? null,
        party: civic?.stateSenate?.party ?? null,
        phone: civic?.stateSenate?.phone ?? null,
        url: civic?.stateSenate?.url ?? null,
        status: civic?.stateSenate ? ("api" as const) : ("scaffold" as const),
        source: civic?.stateSenate ? "Google Civic Information API (build-time)" : "Pending Google Civic or Arkleg lookup",
      },
      usCongress: {
        label: "U.S. House",
        name: civic?.usHouse?.name ?? null,
        district: civic?.usHouse?.district ?? null,
        party: civic?.usHouse?.party ?? null,
        phone: civic?.usHouse?.phone ?? null,
        url: civic?.usHouse?.url ?? null,
        status: civic?.usHouse ? ("api" as const) : ("scaffold" as const),
        source: civic?.usHouse ? "Google Civic Information API (build-time)" : "Pending Google Civic lookup",
      },
      chamberOfCommerce: {
        label: "Chamber of Commerce",
        name: chamber.name,
        url: chamber.url ?? null,
        status: CHAMBER_BY_SLUG[city.slug] ? ("verified" as const) : ("scaffold" as const),
        source: CHAMBER_BY_SLUG[city.slug] ? "city-intelligence/seeds.ts" : "Naming convention — field verify",
        note: "Confirm executive director and membership event calendar",
      },
      rotaryClub: {
        label: "Rotary Club",
        name: defaultRotary(city.name),
        status: "scaffold" as const,
        source: "Naming convention — field verify at rotary.org",
        note: "Recruit club president or service chair for validator conversation",
      },
      mainHighSchool: {
        label: "Main high school",
        name: hs.name,
        title: hs.district,
        status: HIGH_SCHOOL_BY_SLUG[city.slug] ? ("verified" as const) : ("scaffold" as const),
        source: HIGH_SCHOOL_BY_SLUG[city.slug] ? "city-intelligence/seeds.ts" : "Default naming — verify with ADE",
        note: HIGH_SCHOOL_BY_SLUG[city.slug]?.note,
      },
      schoolDistrict: {
        label: "School district",
        name: hs.district,
        status: HIGH_SCHOOL_BY_SLUG[city.slug]?.district ? ("verified" as const) : ("scaffold" as const),
        source: "ADE / district website — field verify",
      },
      localGovernment: {
        label: "City government",
        name: civic?.mayor?.name ?? `${city.name} Mayor & City Council`,
        title: civic?.mayor?.title ?? "Mayor / City Council",
        phone: civic?.mayor?.phone ?? null,
        url: civic?.mayor?.url ?? null,
        status: civic?.mayor ? ("api" as const) : ("scaffold" as const),
        source: civic?.mayor ? "Google Civic Information API" : "Municipal website — field verify",
        note: "Request clerk liaison meeting for registration partnership",
      },
      mediaMarket: {
        label: "Media market",
        name: defaultMediaMarket(city.slug, city.name, city.county),
        status: MEDIA_MARKET_BY_SLUG[city.slug] ? ("verified" as const) : ("inherited" as const),
        source: MEDIA_MARKET_BY_SLUG[city.slug] ? "city-intelligence/seeds.ts" : "County + city influence tags",
      },
      fieldValidatorTargets: {
        label: "Validator targets",
        name: fieldValidatorTargets(city.influenceTags, snap?.influenceCategory ?? "Regional organizing hub"),
        status: "inherited" as const,
        source: "Influence tags + county mission",
      },
    };

    const profile = {
      slug: city.slug,
      name: city.name,
      county: city.county,
      rank: i + 1,
      population2020: city.population2020,
      generatedAt: new Date().toISOString(),
      narrative: {
        geographic: buildGeographicNarrative(city, sharePct, cluster),
        historicalCultural: buildHistoricalCulturalNarrative(city, wiki.excerpt),
        socioEconomic: buildSocioEconomicNarrative(issueRow?.topIssues ?? [], city.county),
        clusterContext: cluster
          ? `${cluster.name}: ${cluster.description}`
          : "Cluster assignment pending — see county playbook.",
        countyContext: [
          countyRow ? `County tier ${countyRow.tier} · primary mission ${countyRow.primaryMission}` : null,
          wiki.seat ? `County seat: ${wiki.seat}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      },
      election: {
        targetVotes,
        baselineVote,
        voteGain,
        influenceCategory: snap?.influenceCategory ?? "Regional organizing hub",
        strategicRole: city.strategicRole,
        influenceTags: city.influenceTags,
        visitFrequency: city.visitFrequency,
        countySharePct: Math.round(sharePct * 10) / 10,
      },
      cluster,
      countyIntel: {
        seat: wiki.seat,
        topIssues: issueRow?.topIssues ?? [],
        wikiExcerpt: wiki.excerpt,
        primaryMission: countyRow?.primaryMission ?? null,
        tier: countyRow?.tier ?? null,
      },
      dimensions,
      enrichmentSummary: countStatuses({ dimensions }),
      sources: [
        "ARKANSAS_TOP_100_CITIES",
        "election-plan-workbench.snapshot.json",
        "kelly-win-target-scenario-v1.json",
        "county-issue-clusters.json",
        "docs/ingested/county-wikipedia",
        civicKey ? "Google Civic Information API" : "Google Civic skipped (no key)",
      ],
      strategicPlanReady: true,
    };

    cities[city.slug] = profile;
    process.stdout.write(`Built ${city.slug} (${i + 1}/${citiesToBuild.length})\n`);
  }

  const bundle = {
    version: 1,
    generatedAt: new Date().toISOString(),
    modelNote:
      "Ten enrichment dimensions per Top 100 priority city plus bonus immersion hubs. API rows cached at build time. Scaffold rows require field verification before public claims.",
    dimensionLabels: {
      stateHouse: "State House district & representative",
      stateSenate: "State Senate district & senator",
      usCongress: "U.S. House district & representative",
      chamberOfCommerce: "Chamber of Commerce",
      rotaryClub: "Rotary / civic club",
      mainHighSchool: "Main high school",
      localGovernment: "City government (mayor / council)",
      schoolDistrict: "School district",
      mediaMarket: "Media market & regional reach",
      fieldValidatorTargets: "Field validator targets (who to recruit)",
    },
    cities,
    buildMeta: {
      civicApiCitiesEnriched: civicFetched,
      civicApiEnabled: Boolean(civicKey),
    },
  };

  writeFileSync(OUT_PATH, JSON.stringify(bundle, null, 2), "utf8");
  console.log(`Wrote ${OUT_PATH} (${Object.keys(cities).length} cities, civic enriched: ${civicFetched})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
