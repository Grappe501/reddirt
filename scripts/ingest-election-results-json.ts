/**
 * DATA-4 + ELECTION-INGEST-1 — load Arkansas election result JSON into Prisma.
 *
 * Usage (from repo root, DATABASE_URL required):
 *   One election JSON per run — use --file (preferred). If you pass --path or rely on the default folder,
 *   that directory must contain exactly one *.json file; otherwise the CLI exits and lists files (use --file).
 *
 *   npm run ingest:election-results -- --file "H:\\SOSWebsite\\campaign information for ingestion\\electionResults\\2024_General.json"
 *   npm run ingest:election-results -- --dry-run --file "..."
 *   npm run ingest:election-results -- --replace --file "..."   # delete existing rows for same sourcePath first
 *
 * Default directory when --file omitted (must have exactly one .json):
 *   H:\SOSWebsite\campaign information for ingestion\electionResults
 */
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/db";
import { importElectionResultsJsonFile } from "../src/lib/campaign-engine/election-results-ingest/import-json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(f: string): boolean {
  return process.argv.includes(f);
}

const DEFAULT_DIR = "H:\\SOSWebsite\\campaign information for ingestion\\electionResults";

async function main() {
  loadEnvConfig(repoRoot);

  if (hasFlag("--help") || hasFlag("-h")) {
    // eslint-disable-next-line no-console
    console.log(`Arkansas election results JSON ingest (DATA-4 / ELECTION-INGEST-1).

  Policy: one election file per run. Add another election with another command.

  --file <path>  Single JSON file (recommended)
  --path <dir>   Directory that contains exactly one *.json (otherwise use --file)
                 Default if neither --file nor --path: ${DEFAULT_DIR}
  --dry-run      Parse only; print estimated row counts (no DB writes)
  --replace      If a row already exists for the same sourcePath, delete it and re-import

Examples:
  npm run ingest:election-results -- --file "${DEFAULT_DIR}\\\\2024_General.json"
  npm run ingest:election-results -- --dry-run --file "${DEFAULT_DIR}\\\\2024_General.json"
`);
    process.exit(0);
  }

  const dryRun = hasFlag("--dry-run");
  const replace = hasFlag("--replace");
  const file = arg("--file");
  const dirExplicit = arg("--path");
  const dir = file ? undefined : (dirExplicit ?? DEFAULT_DIR);

  const files: string[] = [];
  if (file) {
    files.push(path.resolve(file));
  } else if (dir) {
    const abs = path.resolve(dir);
    const jsonInDir: string[] = [];
    for (const ent of readdirSync(abs)) {
      if (!ent.toLowerCase().endsWith(".json")) continue;
      jsonInDir.push(path.join(abs, ent));
    }
    jsonInDir.sort();
    if (jsonInDir.length === 0) {
      // eslint-disable-next-line no-console
      console.error(`No .json files in ${abs} — use --file <path> with one election JSON.`);
      process.exit(1);
    }
    if (jsonInDir.length > 1) {
      // eslint-disable-next-line no-console
      console.error(
        `Multiple .json files in ${abs} (${jsonInDir.length}). Ingest one election per run — pass --file.\n${jsonInDir.map((p) => `  ${p}`).join("\n")}`,
      );
      process.exit(1);
    }
    files.push(jsonInDir[0]!);
  } else {
    // eslint-disable-next-line no-console
    console.error("Provide --file <file> or --path <dir> (dir must contain exactly one .json)");
    process.exit(1);
  }

  const aggregate = {
    filesProcessed: 0,
    sourcesCreated: 0,
    contestsCreated: 0,
    countyRowsCreated: 0,
    precinctRowsCreated: 0,
    candidateRowsCreated: 0,
    precinctCandidateRowsCreated: 0,
    skipped: 0,
    unknown: 0,
    unmatchedCountyNames: new Set<string>(),
  };

  for (const fp of files) {
    if (!statSync(fp).isFile()) continue;
    const base = path.basename(fp, path.extname(fp));
    const r = await importElectionResultsJsonFile({
      prisma,
      absolutePath: fp,
      sourceNameFallback: base,
      dryRun,
      replace,
    });

    aggregate.filesProcessed += 1;
    if (r.parserVariant === "skipped") {
      aggregate.skipped += 1;
      // eslint-disable-next-line no-console
      console.log(`SKIP (already imported): ${fp} — use --replace to re-run`);
      continue;
    }
    if (r.parserVariant === "unknown") {
      aggregate.unknown += 1;
      // eslint-disable-next-line no-console
      console.warn(`UNKNOWN shape: ${fp}`);
      continue;
    }

    aggregate.sourcesCreated += r.sourcesCreated;
    aggregate.contestsCreated += r.contestsCreated;
    aggregate.countyRowsCreated += r.countyRowsCreated;
    aggregate.precinctRowsCreated += r.precinctRowsCreated;
    aggregate.candidateRowsCreated += r.candidateRowsCreated;
    aggregate.precinctCandidateRowsCreated += r.precinctCandidateRowsCreated;
    for (const u of r.unmatchedCountyNames) aggregate.unmatchedCountyNames.add(u);

    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          file: fp,
          parserVariant: r.parserVariant,
          dryRun: r.dryRun,
          replacedExistingSourceId: r.replacedExistingSourceId,
          sourceId: r.sourceId,
          contestsCreated: r.contestsCreated,
          countyRowsCreated: r.countyRowsCreated,
          precinctRowsCreated: r.precinctRowsCreated,
          candidateRowsCreated: r.candidateRowsCreated,
          precinctCandidateRowsCreated: r.precinctCandidateRowsCreated,
          unmatchedCountiesSample: r.unmatchedCountyNames.slice(0, 12),
        },
        null,
        2,
      ),
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    "\n=== VALIDATION SUMMARY ===\n" +
      JSON.stringify(
        {
          ...aggregate,
          unmatchedCountyNames: [...aggregate.unmatchedCountyNames].sort().slice(0, 40),
          unmatchedCountyTotal: aggregate.unmatchedCountyNames.size,
        },
        null,
        2,
      ),
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
