/**
 * INGEST-OPS-3 — compare election JSON files on disk vs `ElectionResultSource` rows (read-only).
 *
 *   cd RedDirt
 *   npm run ingest:election-audit
 *
 * Env: `DATABASE_URL` (via `.env`) when local Postgres is up; otherwise file inventory + SQL hint only.
 * No migrations, no ingest writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const DEFAULT_ELECTION_DIR = path.join(
  repoRoot,
  "..",
  "campaign information for ingestion",
  "electionResults",
);

function normKey(p) {
  return path.resolve(p).replace(/\//g, "\\").toLowerCase();
}

function parseYearType(base) {
  const m = /^(\d{4})/.exec(base);
  const year = m ? m[1] : "";
  const rest = base
    .replace(/\.json$/i, "")
    .replace(/^\d{4}_?/, "")
    .replace(/^\d{4}-/, "");
  const type = rest
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .trim() || "unknown";
  return { year, type: type || "unknown" };
}

async function loadDbRows() {
  loadEnvConfig(repoRoot);
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    return await prisma.electionResultSource.findMany({
      orderBy: { electionDate: "asc" },
      select: {
        id: true,
        sourcePath: true,
        sourceName: true,
        electionName: true,
        electionDate: true,
        parserVariant: true,
        importedAt: true,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dir = process.env.ELECTION_AUDIT_DIR
    ? path.resolve(process.env.ELECTION_AUDIT_DIR)
    : DEFAULT_ELECTION_DIR;

  if (!fs.existsSync(dir)) {
    // eslint-disable-next-line no-console
    console.error(
      `Election results folder not found: ${dir}\nSet ELECTION_AUDIT_DIR or create the canonical path.`,
    );
    process.exit(2);
  }

  const files = fs
    .readdirSync(dir)
    .filter((n) => n.toLowerCase().endsWith(".json"))
    .map((n) => path.join(dir, n));
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // eslint-disable-next-line no-console
  console.log(`--- Election JSON inventory (${files.length} files) ---`);
  for (const f of files) {
    const base = path.basename(f);
    const { year, type } = parseYearType(base);
    // eslint-disable-next-line no-console
    console.log(`${base}\t${year}\t${type}`);
  }

  // eslint-disable-next-line no-console
  console.log("\n--- Database comparison ---");

  try {
    const rows = await loadDbRows();
    const byPath = new Map();
    for (const r of rows) {
      byPath.set(normKey(r.sourcePath), r);
    }

    for (const f of files) {
      const r = byPath.get(normKey(f));
      const st = r ? "ingested" : "missing";
      // eslint-disable-next-line no-console
      console.log(
        `${path.basename(f)}\t${st}\t${r ? r.id : "—"}\t${r ? r.parserVariant : "—"}`,
      );
    }

    if (rows.length) {
      // eslint-disable-next-line no-console
      console.log(
        `\n${rows.length} row(s) in ElectionResultSource (may include paths not in current folder).`,
      );
      for (const r of rows) {
        if (!files.some((f) => normKey(f) === normKey(r.sourcePath))) {
          // eslint-disable-next-line no-console
          console.log(`  (extra in DB) ${r.sourcePath}`);
        }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(
      `Could not connect to database: ${err?.message ?? err}\n` +
        `Start Postgres (e.g. \`npm run dev:db\` in RedDirt/) or run the SQL in docs/ELECTION_INGEST_AUDIT.md`,
    );
    process.exitCode = 1;
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
