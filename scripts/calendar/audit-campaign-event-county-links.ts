import path from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma } from "@prisma/client";

import { prisma } from "../../src/lib/db";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");

loadRedDirtEnv(REPO);

type UnlinkedRow = {
  id: string;
  title: string;
  locationName: string | null;
  internalSummary: string | null;
  description: string | null;
  stagedCounty: string | null;
};

type CountyRow = { id: string; name: string };

const AMBIGUOUS_STATEWIDE_TERMS = new Set(["Arkansas"]);

function guessCounty(row: UnlinkedRow, counties: CountyRow[]): string | null {
  const haystack = [row.title, row.locationName, row.internalSummary, row.description, row.stagedCounty].filter(Boolean).join(" ").toLowerCase();
  const exact = counties.find((c) => {
    if (AMBIGUOUS_STATEWIDE_TERMS.has(c.name) && !/arkansas county/i.test(haystack)) return false;
    return new RegExp(`\\b${c.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(haystack);
  });
  return exact?.name ?? null;
}

async function main() {
  const [counts] = await prisma.$queryRaw<Array<{ total: number; linked: number; unlinked: number }>>(Prisma.sql`
    SELECT
      count(*)::int AS total,
      count("countyId")::int AS linked,
      (count(*) - count("countyId"))::int AS unlinked
    FROM public."CampaignEvent"
  `);
  const counties = await prisma.$queryRaw<CountyRow[]>(Prisma.sql`
    SELECT id::text AS id, name
    FROM public.counties
    ORDER BY length(name) DESC
  `);
  const unlinked = await prisma.$queryRaw<UnlinkedRow[]>(Prisma.sql`
    SELECT
      id,
      title,
      "locationName",
      "internalSummary",
      description,
      ("commsStateJson" #>> '{kellyCockpit,county}') AS "stagedCounty"
    FROM public."CampaignEvent"
    WHERE "countyId" IS NULL
    ORDER BY "startAt" ASC NULLS LAST
    LIMIT 40
  `);
  const rows = unlinked.map((row) => {
    const guessedCounty = guessCounty(row, counties);
    return {
      id: row.id,
      title: row.title,
      locationName: row.locationName,
      stagedCounty: row.stagedCounty,
      guessedCounty,
      canRelink: Boolean(guessedCounty),
    };
  });
  console.log(JSON.stringify({ ok: true, ...counts, sample: rows, relinkableInSample: rows.filter((r) => r.canRelink).length }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
