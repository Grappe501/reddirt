import source from "../../../data/campaign-brain/county-party-intelligence/dpa-county-officers.normalized.json";
import searchSource from "../../../data/campaign-brain/county-party-intelligence/dpa-county-officer-search-chunks.json";
import { normalizeArkansasCountyKey } from "@/lib/events/county-key";

export type DpaOfficerSearchChunk = {
  id: string;
  county: string;
  slug: string;
  title: string;
  href: string;
  type: string;
  sourceUrl: string | null;
  sourcePath: string;
  content: string;
  keywords: string[];
};

export type DpaOfficer = {
  id: string;
  orgKind: "county" | "club";
  orgSlug: string;
  orgName: string;
  countyKey: string | null;
  office: string;
  officeKey: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  phoneDigits: string | null;
  streetAddress: string | null;
  city: string | null;
  zipcode: string | null;
  myCampaignVanId: string | null;
  voterVanId: string | null;
  vacant: boolean;
};

export type DpaOfficerOrg = {
  orgKind: "county" | "club";
  orgSlug: string;
  orgName: string;
  countyKey: string | null;
  href: string;
  officers: DpaOfficer[];
  chair: DpaOfficer | null;
};

type DpaOfficerFile = {
  generatedAt: string;
  source: string;
  disclaimer: string;
  stats: {
    officerRows: number;
    namedOfficers: number;
    vacantOffices: number;
    counties: number;
    clubs: number;
    chairsNamed: number;
    emails: number;
    phones: number;
  };
  officers: DpaOfficer[];
};

const file = source as DpaOfficerFile;
const HSV_SLUG = "hsv-dems";

export function dpaCountyKey(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  if (/^arkansas$/i.test(raw.trim())) return "arkansas";
  return normalizeArkansasCountyKey(raw);
}

export function getDpaCountyOfficerStats() {
  return file.stats;
}

export function getDpaCountyOfficerGeneratedAt() {
  return file.generatedAt;
}

export function getAllDpaOfficers(): DpaOfficer[] {
  return file.officers;
}

export function dpaCountyPartyHref(orgSlug: string): string {
  return `/election-plan/county-parties/${orgSlug}`;
}

function buildOrgs(): DpaOfficerOrg[] {
  const map = new Map<string, DpaOfficerOrg>();
  for (const officer of file.officers) {
    let org = map.get(officer.orgSlug);
    if (!org) {
      org = {
        orgKind: officer.orgKind,
        orgSlug: officer.orgSlug,
        orgName: officer.orgName,
        countyKey: officer.countyKey,
        href: dpaCountyPartyHref(officer.orgSlug),
        officers: [],
        chair: null,
      };
      map.set(officer.orgSlug, org);
    }
    org.officers.push(officer);
    if (!officer.vacant && (officer.officeKey === "chair" || officer.officeKey === "president") && !org.chair) {
      org.chair = officer;
    }
  }
  return [...map.values()].sort((a, b) => a.orgName.localeCompare(b.orgName));
}

const ORGS = buildOrgs();

export function getDpaOfficerOrgs(): DpaOfficerOrg[] {
  return ORGS;
}

export function getDpaOfficerOrg(slugOrCounty: string | null | undefined): DpaOfficerOrg | null {
  if (!slugOrCounty?.trim()) return null;
  const raw = slugOrCounty.trim().toLowerCase();
  const key = dpaCountyKey(slugOrCounty) ?? raw.replace(/-county$/, "");
  return getDpaOfficerOrgs().find((org) => org.orgSlug === raw || org.orgSlug === key) ?? null;
}

export function getDpaOfficersForCounty(slugOrCounty: string | null | undefined): DpaOfficer[] {
  return getDpaOfficerOrg(slugOrCounty)?.officers ?? [];
}

export function getDpaChairForCounty(slugOrCounty: string | null | undefined): DpaOfficer | null {
  return getDpaOfficerOrg(slugOrCounty)?.chair ?? null;
}

export function getHsvDemsOfficerOrg(): DpaOfficerOrg | null {
  return getDpaOfficerOrg(HSV_SLUG);
}

export function isHotSpringsVillageLocation(city?: string | null, eventSlug?: string | null): boolean {
  const blob = `${city ?? ""} ${eventSlug ?? ""}`.toLowerCase();
  return blob.includes("hot springs village") || /\bhsv[-_]/.test(blob) || blob.includes("hsv-dems");
}

export function getDpaOfficerOrgsForLocation(input: {
  countySlug?: string | null;
  countySlugs?: string[];
  city?: string | null;
  eventSlug?: string | null;
}): DpaOfficerOrg[] {
  const slugs = new Set<string>();
  for (const raw of [input.countySlug, ...(input.countySlugs ?? [])]) {
    const org = getDpaOfficerOrg(raw);
    if (org) slugs.add(org.orgSlug);
  }
  if (isHotSpringsVillageLocation(input.city, input.eventSlug)) {
    slugs.add(HSV_SLUG);
  }
  return [...slugs]
    .map((slug) => getDpaOfficerOrg(slug))
    .filter((org): org is DpaOfficerOrg => Boolean(org));
}

export function formatDpaOfficerLine(officer: DpaOfficer, includeContact = true): string {
  if (officer.vacant || !officer.displayName) return `${officer.office} (vacant)`;
  const bits = [`${officer.office} ${officer.displayName}`];
  if (includeContact) {
    if (officer.phone) bits.push(officer.phone);
    if (officer.email) bits.push(officer.email);
  }
  return bits.join(" · ");
}

export function dpaOfficerTelHref(officer: DpaOfficer): string | null {
  if (!officer.phoneDigits) return null;
  return `tel:+1${officer.phoneDigits}`;
}

export function dpaOfficerMailtoHref(officer: DpaOfficer): string | null {
  if (!officer.email) return null;
  return `mailto:${officer.email}`;
}

export function getDpaOfficerSearchChunks(): DpaOfficerSearchChunk[] {
  return (searchSource as { chunks: DpaOfficerSearchChunk[] }).chunks;
}

export function formatDpaMailingAddress(officer: DpaOfficer): string | null {
  const line = [officer.streetAddress, officer.city, officer.zipcode ? `AR ${officer.zipcode}` : null]
    .filter(Boolean)
    .join(", ");
  return line || null;
}
