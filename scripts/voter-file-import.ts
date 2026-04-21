/**
 * Run from repo root (needs DATABASE_URL, optional column overrides — see `sos-voter-csv.ts`):
 *   npx tsx scripts/voter-file-import.ts --file path/to/sos-voters.csv --as-of 2026-01-15
 *   npx tsx scripts/voter-file-import.ts --file path/to/file.txt   # as-of defaults to local date
 */
import { runVoterFileImportFromFile } from "../src/lib/voter-file/run-voter-file-import";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(f: string): boolean {
  return process.argv.includes(f);
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    // eslint-disable-next-line no-console
    console.log(`
SOS-style voter file import (CSV/TSV/pipe, UTF-8, header row).

  --file <path>     Required. Path to the voter file.
  --as-of <date>    Optional. YYYY-MM-DD for snapshot fileAsOfDate (default: today UTC).
  --notes <text>    Optional. Stored on VoterFileSnapshot.operatorNotes

Column names default to VOTER_ID, COUNTY_FIPS, REGISTRATION_DATE, optional CITY, PRECINCT.
Override with env: VOTER_FILE_COL_VOTER_ID, VOTER_FILE_COL_COUNTY_FIPS, etc.

Example:
  npx tsx scripts/voter-file-import.ts --file .\\\\data\\\\voters.csv --as-of 2026-01-15
`);
    process.exit(0);
  }

  const file = arg("--file");
  if (!file) {
    // eslint-disable-next-line no-console
    console.error("Missing --file <path>");
    process.exit(1);
  }

  const asOfRaw = arg("--as-of");
  let fileAsOfDate: Date;
  if (asOfRaw) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(asOfRaw)) {
      fileAsOfDate = new Date(`${asOfRaw}T12:00:00.000Z`);
    } else {
      const d = new Date(asOfRaw);
      fileAsOfDate = Number.isNaN(d.getTime()) ? new Date() : d;
    }
  } else {
    const d = new Date();
    fileAsOfDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0));
  }

  const notes = arg("--notes");

  const r = await runVoterFileImportFromFile({
    filePath: file,
    fileAsOfDate,
    fileReceivedAt: new Date(),
    operatorNotes: notes,
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        snapshotId: r.snapshotId,
        sourceFileHash: r.sourceFileHash,
        rowCountInFile: r.rowCountInFile,
        rowCountProcessed: r.rowCountProcessed,
        newCount: r.newCount,
        reactivatedCount: r.reactivatedCount,
        removedCount: r.removedCount,
        unmappedFipsCount: r.unmappedFipsCount,
        errorLineCount: r.errorLineCount,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
