import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminVoterImportPage() {
  const snapshots = await prisma.voterFileSnapshot.findMany({
    orderBy: { importedAt: "desc" },
    take: 25,
    select: {
      id: true,
      status: true,
      fileAsOfDate: true,
      importedAt: true,
      sourceFilename: true,
      sourceFileHash: true,
      rowCountProcessed: true,
      errorMessage: true,
      operatorNotes: true,
      previousSnapshotId: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Voter file import</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Monthly Arkansas SOS (or compatible) files are ingested on a machine with database access. The web UI lists
        recent snapshots; the CLI is the supported path for full-state files.
      </p>

      <section className="mt-8 rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Run an import (CLI)</h2>
        <p className="mt-2 font-mono text-xs leading-relaxed text-deep-soil/85">
          From the project root, with <code className="rounded bg-deep-soil/5 px-1">DATABASE_URL</code> set:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-deep-soil/10 bg-washed-canvas p-3 text-xs text-deep-soil">
          npm run voter-file:import -- --file path/to/voters.csv --as-of 2026-01-15
        </pre>
        <p className="mt-2 font-body text-xs text-deep-soil/60">
          Defaults: UTF-8, header row, delimiters auto-detected. Columns: VOTER_ID, COUNTY_FIPS, REGISTRATION_DATE (env
          overrides: VOTER_FILE_COL_*). See <code className="rounded bg-deep-soil/5 px-1">src/lib/voter-file/sos-voter-csv.ts</code>{" "}
          for the full spec.
        </p>
        <p className="mt-2 font-body text-xs text-deep-soil/60">
          <code className="rounded bg-deep-soil/5 px-1">npm run voter-file:import -- --help</code> for options.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Recent snapshots</h2>
        {snapshots.length === 0 ? (
          <p className="mt-2 text-sm text-deep-soil/60">No snapshots yet.</p>
        ) : (
          <ul className="mt-4 space-y-3" role="list">
            {snapshots.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-deep-soil/10 bg-cream-canvas px-4 py-3 text-sm text-deep-soil/90"
              >
                <p className="font-semibold text-deep-soil">
                  {s.fileAsOfDate.toLocaleDateString()} · {s.status}
                  {s.sourceFilename ? <span className="font-normal text-deep-soil/70"> — {s.sourceFilename}</span> : null}
                </p>
                <p className="mt-1 text-xs text-deep-soil/60">
                  id {s.id} · imported {s.importedAt.toLocaleString()} · rows {s.rowCountProcessed ?? "—"}
                </p>
                {s.sourceFileHash ? (
                  <p className="mt-0.5 font-mono text-[10px] text-deep-soil/50">sha256 {s.sourceFileHash}</p>
                ) : null}
                {s.errorMessage ? <p className="mt-1 text-xs text-red-dirt/90">{s.errorMessage}</p> : null}
                {s.operatorNotes ? (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-deep-soil/75">{s.operatorNotes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
