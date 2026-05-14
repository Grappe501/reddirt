import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma } from "@prisma/client";

import { prisma } from "../../src/lib/db";
import { loadRedDirtEnv } from "../load-red-dirt-env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..", "..");
const COUNTIES_FILE = path.join(REPO, "data/calendar-command-center/arkansas-counties-75.json");

loadRedDirtEnv(REPO);

type CountiesFile = {
  counties?: unknown[];
};

type ExistingCounty = {
  id: string;
  name: string;
  fips: string | null;
};

type Report = {
  created: number;
  existing: number;
  updated: number;
  skipped: Array<{ name: string; reason: string }>;
};

function normalizeName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length ? name : null;
}

async function findCountyByName(name: string): Promise<ExistingCounty | null> {
  const rows = await prisma.$queryRaw<ExistingCounty[]>(Prisma.sql`
    SELECT id::text AS id, name, fips
    FROM public.counties
    WHERE lower(name) = lower(${name})
    LIMIT 1
  `);
  return rows[0] ?? null;
}

async function main() {
  const parsed = JSON.parse(await readFile(COUNTIES_FILE, "utf8")) as CountiesFile;
  const names = (parsed.counties ?? []).map(normalizeName).filter((name): name is string => Boolean(name));
  const report: Report = { created: 0, existing: 0, updated: 0, skipped: [] };

  for (const name of names) {
    const existing = await findCountyByName(name);
    if (existing) {
      report.existing += 1;
      continue;
    }

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO public.counties (name)
      VALUES (${name})
    `);
    report.created += 1;
  }

  const finalCount = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
    SELECT count(*)::int AS count
    FROM public.counties
  `);

  console.log(JSON.stringify({ ok: true, sourceCount: names.length, finalCountyCount: finalCount[0]?.count ?? null, ...report }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
