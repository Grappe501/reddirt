import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { databaseUnavailableResponse, isDatabaseConfigured } from "@/lib/env";
import { buildAggregateVoterModelingChunks } from "@/lib/voter-modeling/aggregate-chunks";

export const dynamic = "force-dynamic";

/**
 * Aggregate-only voter modeling chunks (no row-level PII). Admin session required.
 * See `docs/VOTER_MODELING_HARD_PATH.md` for escalating tiers.
 */
export async function GET(req: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(databaseUnavailableResponse(), { status: 503 });
  }

  const url = new URL(req.url);
  const countySlug = url.searchParams.get("countySlug")?.trim() || undefined;
  const includeState = url.searchParams.get("state") !== "0";

  const result = await buildAggregateVoterModelingChunks(
    countySlug ? { countySlug } : undefined,
  );

  if (!result.ok && result.reason === "schema_tables_missing") {
    return NextResponse.json(
      {
        ok: false,
        error: "database_schema_missing",
        hint: "This DATABASE_URL has no RedDirt tables yet (or points at the wrong database). Apply migrations to the target DB, or use local Docker per RedDirt README.",
        message: result.message,
      },
      { status: 503 },
    );
  }

  if (!result.ok) {
    if (result.reason === "no_complete_snapshot") {
      return NextResponse.json(
        {
          ok: true,
          tier: "AGGREGATE",
          note: "No COMPLETE voter file snapshot with county metrics found. Run import / ETL first.",
          chunks: [],
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "query_failed", message: result.message },
      { status: 500 },
    );
  }

  let chunks = result.chunks;
  if (!includeState) {
    chunks = chunks.filter((c) => c.tier !== "AGGREGATE_STATE");
  }

  return NextResponse.json({
    ok: true,
    domain: "voter-modeling",
    dataClass: "aggregate_county_rollups",
    noRowLevelPii: true,
    snapshotId: result.snapshotId,
    fileAsOfDateIso: result.fileAsOfDateIso,
    sourceRowCountProcessed: result.rowCountProcessed,
    chunkCount: chunks.length,
    chunks,
    endpoints: {
      all: "/api/admin/voter-modeling/chunks",
      oneCounty: "/api/admin/voter-modeling/chunks?countySlug=pulaski",
      countiesOnly: "/api/admin/voter-modeling/chunks?state=0",
    },
  });
}
