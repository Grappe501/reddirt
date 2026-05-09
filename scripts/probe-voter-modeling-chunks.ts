/**
 * Optional: tests DB connectivity + aggregate chunk builder. Run: npm run voter-modeling:probe
 */
import { buildAggregateVoterModelingChunks } from "../src/lib/voter-modeling/aggregate-chunks";

async function main() {
  const r = await buildAggregateVoterModelingChunks();
  if (!r.ok) {
    if (r.reason === "schema_tables_missing") {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify(
          {
            ok: false,
            skipped: true,
            reason: "schema_tables_missing",
            hint: "Point DATABASE_URL at a database with Prisma migrations applied, or run local Docker + migrate.",
          },
          null,
          2,
        ),
      );
      process.exit(0);
    }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ok: false, reason: r.reason, message: r.message }, null, 2));
    process.exit(r.reason === "query_failed" ? 1 : 0);
  }
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        snapshotId: r.snapshotId,
        fileAsOfDateIso: r.fileAsOfDateIso,
        rowCountProcessed: r.rowCountProcessed,
        chunkCount: r.chunks.length,
      },
      null,
      2,
    ),
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
