/**
 * Build raw community opportunity graph from fair audit + category stubs (file-staged).
 * Run from RedDirt: npm run opportunities:scrape
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

import type { ArkansasCountyFairRow } from "@/lib/fairs/arkansas-county-fair-types";
import type {
  CommunityOpportunity,
  CommunityOpportunityCampaignValue,
  CommunityOpportunitySourceType,
  CommunityOpportunityVerificationStatus,
  HighSchoolFootballOpportunity,
} from "@/lib/opportunities/community-opportunity-types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
loadEnvConfig(root);

function mapFairCampaign(v: ArkansasCountyFairRow["campaignValue"]): CommunityOpportunityCampaignValue {
  if (v === "combine_with_nearby") return "good_add_on";
  if (v === "must_attend" || v === "high_value" || v === "send_local" || v === "monitor") return v;
  return "good_add_on";
}

function mapFairSource(st: ArkansasCountyFairRow["sourceType"]): CommunityOpportunitySourceType {
  const m: Record<ArkansasCountyFairRow["sourceType"], CommunityOpportunitySourceType> = {
    burt_database: "burt_database",
    official_fair_site: "official_site",
    county_extension: "county_extension",
    facebook: "facebook",
    chamber: "chamber",
    tourism_calendar: "tourism",
    newspaper: "manual",
    manual: "manual",
  };
  return m[st] ?? "manual";
}

function mapFairVerification(st: ArkansasCountyFairRow["verificationStatus"]): CommunityOpportunityVerificationStatus {
  if (st === "not_county_fair") return "not_relevant";
  return st;
}

function fairToOpportunity(r: ArkansasCountyFairRow): CommunityOpportunity {
  const startAt = r.bestCandidateDate ? `${r.bestCandidateDate}T19:00:00-05:00` : undefined;
  return {
    id: r.id,
    type: "county_fair",
    title: r.fairName,
    county: r.county,
    city: r.city,
    venue: r.venue,
    address: r.address,
    startAt: r.startDate ? `${r.startDate}T18:00:00-05:00` : startAt,
    endAt: r.endDate ? `${r.endDate}T22:00:00-05:00` : undefined,
    bestCandidateArrival: r.bestCandidateDate ? `${r.bestCandidateDate}T18:30:00-05:00` : undefined,
    minimumAppearanceMinutes: 45,
    idealAppearanceMinutes: 120,
    sourceUrl: r.sourceUrl,
    sourceType: mapFairSource(r.sourceType),
    verificationStatus: mapFairVerification(r.verificationStatus),
    confidence: r.confidence,
    campaignValue: mapFairCampaign(r.campaignValue),
    recommendedCoverage: r.recommendedCoverage,
    audienceTags: ["families", "farm_ag", "persuasion"],
    routeCluster: r.routeCluster,
    notes: [r.bestCandidateTimeWindow, r.notes].filter(Boolean).join(" · ") || undefined,
  };
}

function ehcStub(county: string): CommunityOpportunity {
  return {
    id: `ehc-${county.toLowerCase().replace(/\s+/g, "-")}-stub`,
    type: "extension_homemakers",
    title: `${county} County Extension Homemakers / EHC — verify council calendar`,
    county,
    minimumAppearanceMinutes: 30,
    idealAppearanceMinutes: 60,
    sourceType: "county_extension",
    verificationStatus: "needs_confirmation",
    confidence: 0.2,
    campaignValue: "good_add_on",
    recommendedCoverage: "kelly_plus_local_host",
    audienceTags: ["families", "farm_ag", "civic_leaders"],
    routeCluster: undefined,
    notes:
      "Search: county extension office calendar, UA Division of Agriculture events, EHC council. Confirm public/candidate-appropriate visit.",
  };
}

function aeaStub(county: string): CommunityOpportunity {
  return {
    id: `aea-${county.toLowerCase().replace(/\s+/g, "-")}-stub`,
    type: "aea_meeting",
    title: `${county} County — AEA local / area meeting (verify schedule)`,
    county,
    minimumAppearanceMinutes: 30,
    idealAppearanceMinutes: 60,
    sourceType: "aea",
    verificationStatus: "needs_confirmation",
    confidence: 0.2,
    campaignValue: "high_value",
    recommendedCoverage: "kelly_plus_local_host",
    audienceTags: ["teachers", "labor", "democratic_base"],
    notes: "Arkansas Education Association locals, district back-to-school, town halls — confirm access + optics with organizers.",
  };
}

function artaStub(county: string): CommunityOpportunity {
  return {
    id: `arta-${county.toLowerCase().replace(/\s+/g, "-")}-stub`,
    type: "retired_teachers",
    title: `${county} County retired educators unit (ARTA / local) — verify cadence`,
    county,
    minimumAppearanceMinutes: 25,
    idealAppearanceMinutes: 45,
    sourceType: "retired_teachers",
    verificationStatus: "needs_confirmation",
    confidence: 0.2,
    campaignValue: "good_add_on",
    recommendedCoverage: "kelly_plus_local_host",
    audienceTags: ["retirees", "teachers", "democratic_base"],
    notes: "Often lunch meetings — confirm speaker policy and public vs members-only.",
  };
}

const CAMPUSES: Array<Pick<CommunityOpportunity, "title" | "county" | "city" | "notes">> = [
  { county: "Washington", city: "Fayetteville", title: "University of Arkansas — campus / student life calendar (verify)", notes: "Homecoming, welcome week, voter reg, major forums." },
  { county: "Craighead", city: "Jonesboro", title: "Arkansas State University — campus calendar (verify)", notes: "Game days, student org fairs, public lectures." },
  { county: "Faulkner", city: "Conway", title: "University of Central Arkansas — campus calendar (verify)", notes: "" },
  { county: "Pulaski", city: "Little Rock", title: "UA Little Rock — campus calendar (verify)", notes: "" },
  { county: "Jefferson", city: "Pine Bluff", title: "UAPB — campus calendar (verify)", notes: "" },
  { county: "Columbia", city: "Magnolia", title: "Southern Arkansas University — campus calendar (verify)", notes: "" },
  { county: "Pope", city: "Russellville", title: "Arkansas Tech University — campus calendar (verify)", notes: "" },
  { county: "White", city: "Searcy", title: "Harding University — campus calendar (verify)", notes: "Private campus — confirm guest policy before outreach." },
  { county: "Independence", city: "Batesville", title: "Lyon College — campus calendar (verify)", notes: "" },
  { county: "Clark", city: "Arkadelphia", title: "Ouachita Baptist / Henderson — campus calendars (verify)", notes: "" },
  { county: "Garland", city: "Hot Springs", title: "National Park College — events (verify)", notes: "Community college / UA system branch as applicable." },
  { county: "Sebastian", city: "Fort Smith", title: "UAFS — campus calendar (verify)", notes: "" },
];

function campusRow(i: number, c: (typeof CAMPUSES)[number]): CommunityOpportunity {
  return {
    id: `campus-${i}-${c.county.toLowerCase()}`,
    type: "campus_event",
    title: c.title,
    county: c.county,
    city: c.city,
    minimumAppearanceMinutes: 40,
    idealAppearanceMinutes: 90,
    sourceType: "campus_calendar",
    verificationStatus: "date_not_posted",
    confidence: 0.22,
    campaignValue: "high_value",
    recommendedCoverage: "kelly_plus_local_host",
    audienceTags: ["students", "persuasion", "families"],
    notes: c.notes || "Low-key community presence; confirm policy with campus/student life.",
  };
}

/** Research targets only — staff must confirm schools, dates, and AD access before scheduling. */
const FOOTBALL_TARGETS: HighSchoolFootballOpportunity[] = [
  {
    id: "fb-target-washington-springdale-fayetteville",
    type: "high_school_football",
    title: "Washington County — major 7A Friday matchup corridor (verify AHSAA week + schools)",
    county: "Washington",
    city: "Fayetteville",
    homeTeam: "TBD",
    awayTeam: "TBD",
    rivalryName: "Springdale–Fayetteville corridor (research)",
    classification: "7A",
    estimatedAttendanceTier: "very_large",
    minimumAppearanceMinutes: 30,
    idealAppearanceMinutes: 60,
    sourceType: "aaa_ahsaa",
    verificationStatus: "needs_confirmation",
    confidence: 0.15,
    campaignValue: "high_value",
    recommendedCoverage: "kelly_plus_local_host",
    audienceTags: ["sports_crowd", "families", "persuasion"],
    recommendedCandidateRole: "tailgate_drop_in",
    notes:
      "Optics: community member / tailgate drop-in only unless school invites. No partisan signage on school property. Confirm with admin.",
  },
  {
    id: "fb-target-pulaski-central-catholic",
    type: "high_school_football",
    title: "Pulaski County — historic rivalry night (verify date + stadium policy)",
    county: "Pulaski",
    city: "Little Rock",
    homeTeam: "Little Rock Central",
    awayTeam: "Little Rock Catholic",
    rivalryName: "Central vs Catholic",
    classification: "6A/7A",
    estimatedAttendanceTier: "large",
    minimumAppearanceMinutes: 30,
    idealAppearanceMinutes: 45,
    sourceType: "school_athletics",
    verificationStatus: "needs_confirmation",
    confidence: 0.2,
    campaignValue: "high_value",
    recommendedCoverage: "kelly_plus_local_host",
    audienceTags: ["sports_crowd", "persuasion", "families"],
    recommendedCandidateRole: "stands_handshakes",
    notes: "High-profile — staff must confirm access and school policy before any candidate plan.",
  },
  {
    id: "fb-target-saline-benton-bryant",
    type: "high_school_football",
    title: "Saline County — Benton vs Bryant corridor (verify week)",
    county: "Saline",
    homeTeam: "TBD",
    awayTeam: "TBD",
    rivalryName: "Benton vs Bryant (research)",
    classification: "6A/7A",
    estimatedAttendanceTier: "large",
    minimumAppearanceMinutes: 30,
    idealAppearanceMinutes: 60,
    sourceType: "aaa_ahsaa",
    verificationStatus: "needs_confirmation",
    confidence: 0.18,
    campaignValue: "good_add_on",
    recommendedCoverage: "local_surrogate",
    audienceTags: ["sports_crowd", "families"],
    recommendedCandidateRole: "local_surrogate",
    notes: "Strong attendance — candidate may be one of several stops; local guide recommended.",
  },
  {
    id: "fb-target-sebastian-fort-smith-northside",
    type: "high_school_football",
    title: "Sebastian County — Fort Smith metro Friday (verify matchup)",
    county: "Sebastian",
    city: "Fort Smith",
    homeTeam: "TBD",
    awayTeam: "TBD",
    rivalryName: "Fort Smith metro rivalry (research)",
    classification: "6A/7A",
    estimatedAttendanceTier: "large",
    minimumAppearanceMinutes: 30,
    idealAppearanceMinutes: 60,
    sourceType: "aaa_ahsaa",
    verificationStatus: "needs_confirmation",
    confidence: 0.18,
    campaignValue: "good_add_on",
    recommendedCoverage: "kelly_plus_local_host",
    audienceTags: ["sports_crowd", "persuasion"],
    recommendedCandidateRole: "tailgate_drop_in",
    notes: "Pair with River Valley fair weekends when possible.",
  },
  {
    id: "fb-target-jefferson-white-hall-pine-bluff",
    type: "high_school_football",
    title: "Jefferson County — Pine Bluff vs White Hall (verify season schedule)",
    county: "Jefferson",
    city: "Pine Bluff",
    homeTeam: "Pine Bluff",
    awayTeam: "White Hall",
    rivalryName: "Pine Bluff vs White Hall",
    classification: "5A/6A",
    estimatedAttendanceTier: "medium",
    minimumAppearanceMinutes: 25,
    idealAppearanceMinutes: 45,
    sourceType: "school_athletics",
    verificationStatus: "needs_confirmation",
    confidence: 0.2,
    campaignValue: "good_add_on",
    recommendedCoverage: "local_surrogate",
    audienceTags: ["sports_crowd", "democratic_base"],
    recommendedCandidateRole: "stands_handshakes",
    notes: "Coordinate with Southeast fair routing.",
  },
];

async function main() {
  const fairsPath = path.join(root, "data/calendar-command-center/arkansas-county-fairs-2026.normalized.json");
  let fairRows: ArkansasCountyFairRow[] = [];
  try {
    const raw = JSON.parse(await readFile(fairsPath, "utf8")) as { rows?: ArkansasCountyFairRow[] };
    fairRows = raw.rows ?? [];
  } catch {
    console.warn("No arkansas-county-fairs-2026.normalized.json — fair-derived rows skipped.");
  }

  const fromFairs = fairRows.map(fairToOpportunity);
  const counties = [...new Set(fromFairs.map((r) => r.county))].sort();

  const stubs: CommunityOpportunity[] = [];
  for (const c of counties) {
    stubs.push(ehcStub(c), aeaStub(c), artaStub(c));
  }
  CAMPUSES.forEach((camp, i) => stubs.push(campusRow(i, camp)));
  stubs.push(...FOOTBALL_TARGETS);

  const rows: CommunityOpportunity[] = [...fromFairs, ...stubs];

  const outDir = path.join(root, "data/calendar-command-center");
  await mkdir(outDir, { recursive: true });
  const out = path.join(outDir, "community-opportunities-2026.raw.json");
  await writeFile(
    out,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "scrape-community-opportunities.ts",
        fairSourceFile: "arkansas-county-fairs-2026.normalized.json",
        count: rows.length,
        rows,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`Wrote ${rows.length} rows → ${path.relative(root, out)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
