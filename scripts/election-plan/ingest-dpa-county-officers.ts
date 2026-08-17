/**
 * Ingest the DPA public county-officer list into election-plan JSON.
 *
 * Source: data/campaign-brain/county-party-intelligence/dpa-county-officers.public-list.csv
 * Run: npm run election-plan:county-officers:ingest
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ARKANSAS_COUNTIES } from "../../src/data/kelly-county-visits/arkansas-counties";
import { normalizeArkansasCountyKey } from "../../src/lib/events/county-key";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data/campaign-brain/county-party-intelligence");
const CSV_PATH = path.join(DATA_DIR, "dpa-county-officers.public-list.csv");
const OUT_PATH = path.join(DATA_DIR, "dpa-county-officers.normalized.json");
const SEARCH_PATH = path.join(DATA_DIR, "dpa-county-officer-search-chunks.json");

type OfficerRow = {
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

const OFFICE_ORDER: Record<string, number> = {
  chair: 10,
  president: 11,
  "1st-vice-president": 20,
  "2nd-vice-president": 21,
  "vice-chair": 22,
  treasurer: 30,
  secretary: 40,
  "election-commissioner": 50,
  communications: 60,
  "marketing-web": 70,
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      continue;
    }
    field += ch;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    if (row.some((cell) => cell.trim())) rows.push(row);
  }
  return rows;
}

function clean(value: string | undefined): string | null {
  const t = (value ?? "").replace(/\u00a0/g, " ").trim();
  return t ? t : null;
}

function officeKey(office: string): string {
  return office
    .toLowerCase()
    .replace(/\*/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/^vicechair$/, "vice-chair");
}

function displayName(first: string | null, last: string | null): string | null {
  const name = [first, last].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return name || null;
}

function phoneDigits(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits.length >= 10 ? digits : null;
}

function dpaCountyKey(rawCounty: string): string | null {
  if (/^arkansas$/i.test(rawCounty.trim())) return "arkansas";
  return normalizeArkansasCountyKey(rawCounty);
}

function clubFor(rawCounty: string): { orgSlug: string; orgName: string } | null {
  if (/^hsv\s*dems$/i.test(rawCounty)) {
    return { orgSlug: "hsv-dems", orgName: "Hot Springs Village Democratic Club" };
  }
  return null;
}

function main(): void {
  const csv = readFileSync(CSV_PATH, "utf8");
  const table = parseCsv(csv);
  const header = table[0]?.map((h) => h.trim());
  if (!header || header[0] !== "County") {
    throw new Error("Unexpected DPA officer CSV header");
  }

  const officers: OfficerRow[] = [];
  const unknownGroups = new Set<string>();

  for (let i = 1; i < table.length; i++) {
    const cells = table[i];
    const rawCounty = clean(cells[0]);
    const officeRaw = clean(cells[1]);
    if (!rawCounty || !officeRaw) continue;

    const club = clubFor(rawCounty);
    const countyKey = club ? null : dpaCountyKey(rawCounty);
    if (!club && !countyKey) {
      unknownGroups.add(rawCounty);
      continue;
    }

    const firstName = clean(cells[5]) ?? "";
    const lastName = clean(cells[4]) ?? "";
    const name = displayName(firstName, lastName);
    const phone = clean(cells[7]);
    const orgSlug = club?.orgSlug ?? countyKey!;
    const orgName = club?.orgName ?? `${countyKey === "st-francis" ? "St. Francis" : rawCounty} County Democratic Party`;
    const office = officeRaw.replace(/\s+/g, " ").replace(/\*$/, "").trim();
    const key = officeKey(office);

    officers.push({
      id: `${orgSlug}:${key}:${i}`,
      orgKind: club ? "club" : "county",
      orgSlug,
      orgName,
      countyKey,
      office,
      officeKey: key,
      firstName,
      lastName,
      displayName: name,
      email: clean(cells[6])?.toLowerCase() ?? null,
      phone,
      phoneDigits: phoneDigits(phone),
      streetAddress: clean(cells[8]),
      city: clean(cells[9]),
      zipcode: clean(cells[10]),
      myCampaignVanId: clean(cells[2]),
      voterVanId: clean(cells[3]),
      vacant: !name,
    });
  }

  if (unknownGroups.size > 0) {
    throw new Error(`Unmapped DPA groups: ${[...unknownGroups].join(", ")}`);
  }

  officers.sort((a, b) => {
    const org = a.orgName.localeCompare(b.orgName);
    if (org !== 0) return org;
    const ao = OFFICE_ORDER[a.officeKey] ?? 80;
    const bo = OFFICE_ORDER[b.officeKey] ?? 80;
    if (ao !== bo) return ao - bo;
    return a.office.localeCompare(b.office);
  });

  const countyKeys = new Set(officers.filter((o) => o.orgKind === "county").map((o) => o.countyKey));
  const missingCounties = ARKANSAS_COUNTIES.filter((name) => !countyKeys.has(dpaCountyKey(name)));
  if (missingCounties.length > 0) {
    throw new Error(`DPA list missing counties: ${missingCounties.join(", ")}`);
  }

  const named = officers.filter((o) => !o.vacant);
  const chairs = officers.filter((o) => o.officeKey === "chair" && !o.vacant);
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: "DPA County Officer (Public List)",
    disclaimer:
      "Democratic Party of Arkansas public county-officer list. Operator / election-plan use only. Do not publish emails, phones, addresses, or VAN IDs on the public website.",
    stats: {
      officerRows: officers.length,
      namedOfficers: named.length,
      vacantOffices: officers.filter((o) => o.vacant).length,
      counties: countyKeys.size,
      clubs: new Set(officers.filter((o) => o.orgKind === "club").map((o) => o.orgSlug)).size,
      chairsNamed: chairs.length,
      emails: named.filter((o) => o.email).length,
      phones: named.filter((o) => o.phone).length,
    },
    officers,
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const byOrg = new Map<string, OfficerRow[]>();
  for (const officer of officers) {
    const list = byOrg.get(officer.orgSlug) ?? [];
    list.push(officer);
    byOrg.set(officer.orgSlug, list);
  }

  const chunks = [...byOrg.entries()].map(([slug, list]) => {
    const orgName = list[0]?.orgName ?? slug;
    const namedLines = list
      .filter((o) => !o.vacant)
      .map((o) => {
        const bits = [o.office, o.displayName, o.email, o.phone, o.city].filter(Boolean);
        return bits.join(" · ");
      });
    return {
      id: `dpa-officers:${slug}`,
      county: list[0]?.countyKey ? orgName.replace(/ County Democratic Party$/, "") : orgName,
      slug,
      title: `${orgName} officers`,
      href: `/election-plan/county-parties/${slug}`,
      type: "County Party Officers",
      sourceUrl: null,
      sourcePath: "data/campaign-brain/county-party-intelligence/dpa-county-officers.normalized.json",
      content: namedLines.join("\n"),
      keywords: [
        slug,
        orgName.toLowerCase(),
        "county party",
        "dpa",
        "officers",
        "chair",
        ...list.flatMap((o) => [o.displayName, o.office, o.email].filter(Boolean).map((v) => String(v).toLowerCase())),
      ],
    };
  });

  writeFileSync(
    SEARCH_PATH,
    `${JSON.stringify({ version: 1, generatedAt: payload.generatedAt, chunks }, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `DPA officers ingested: ${payload.stats.namedOfficers} named / ${payload.stats.officerRows} rows / ${payload.stats.counties} counties / ${payload.stats.chairsNamed} chairs`,
  );
}

main();
