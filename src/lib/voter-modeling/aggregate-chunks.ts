import { Prisma, VoterFileIngestStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Safe-for-modeling tier: no row-level PII; rollup keyed by public county slug only. */
export type VoterModelingTier = "AGGREGATE_COUNTY" | "AGGREGATE_STATE";

export type VoterModelingChunk = {
  id: string;
  tier: VoterModelingTier;
  snapshotId: string;
  fileAsOfDateIso: string;
  countySlug?: string;
  countyDisplayName?: string;
  structured: Record<string, unknown>;
  plainText: string;
};

function toIso(d: Date): string {
  return d.toISOString();
}

function buildCountyPlainText(args: {
  displayName: string;
  slug: string;
  asOfDateIso: string;
  totalRegisteredCount: number | null;
  newRegistrationsSinceBaseline: number;
  newRegistrationsSincePreviousSnapshot: number;
  droppedSincePreviousSnapshot: number;
  netChangeSincePreviousSnapshot: number;
  countyGoal: number | null;
  progressPercent: number | null;
}): string {
  const lines = [
    `County voter modeling context (aggregate only, no individual voters): ${args.displayName} (${args.slug}).`,
    `Rollup as of file date ${args.asOfDateIso}.`,
    `Total registered in file for county: ${args.totalRegisteredCount ?? "unknown"}.`,
    `New registrations since baseline: ${args.newRegistrationsSinceBaseline}.`,
    `New since prior snapshot: ${args.newRegistrationsSincePreviousSnapshot}; dropped: ${args.droppedSincePreviousSnapshot}; net: ${args.netChangeSincePreviousSnapshot}.`,
  ];
  if (args.countyGoal != null) {
    lines.push(`Program county registration goal: ${args.countyGoal}.`);
  }
  if (args.progressPercent != null) {
    lines.push(`Progress toward goal (percent): ${args.progressPercent}.`);
  }
  lines.push("Do not treat this chunk as individual-level voter data; it is a jurisdiction aggregate.");
  return lines.join(" ");
}

function buildStatePlainText(args: {
  asOfDateIso: string;
  countyCount: number;
  sumTotalRegistered: number;
  sumNewBaseline: number;
  sumNetSincePrev: number;
}): string {
  return [
    "Statewide voter file modeling context (aggregate only): Arkansas county rollups from the same voter file snapshot.",
    `Rollup as of ${args.asOfDateIso}; ${args.countyCount} counties with metrics.`,
    `Sum of reported county registered totals: ${args.sumTotalRegistered} (nullable counties treated as zero in this sum — verify in source metrics).`,
    `Sum of new registrations since baseline across counties: ${args.sumNewBaseline}.`,
    `Sum of net change since previous snapshot: ${args.sumNetSincePrev}.`,
    "This is for modeling turnout capacity and registration pace at aggregate level, not microtargeting from this payload.",
  ].join(" ");
}

export type BuildAggregateChunksResult =
  | {
      ok: true;
      snapshotId: string;
      fileAsOfDateIso: string;
      rowCountProcessed: number | null;
      chunks: VoterModelingChunk[];
    }
  | { ok: false; reason: "no_complete_snapshot" | "query_failed" | "schema_tables_missing"; message?: string };

/**
 * Latest COMPLETE snapshot that already has county rollups. Safe default for strategy / modeling agents.
 */
export async function buildAggregateVoterModelingChunks(filters?: {
  countySlug?: string;
}): Promise<BuildAggregateChunksResult> {
  try {
    const snapshot = await prisma.voterFileSnapshot.findFirst({
      where: {
        status: VoterFileIngestStatus.COMPLETE,
        countyMetrics: { some: {} },
      },
      orderBy: [{ fileAsOfDate: "desc" }, { importedAt: "desc" }],
    });

    if (!snapshot) {
      return { ok: false, reason: "no_complete_snapshot" };
    }

    const metrics = await prisma.countyVoterMetrics.findMany({
      where: {
        voterFileSnapshotId: snapshot.id,
        ...(filters?.countySlug ? { countySlug: filters.countySlug } : {}),
      },
      include: {
        county: { select: { displayName: true, slug: true } },
      },
      orderBy: { countySlug: "asc" },
    });

    const asOfIso = toIso(snapshot.fileAsOfDate);
    const chunks: VoterModelingChunk[] = [];

    for (const m of metrics) {
      const displayName = m.county.displayName;
      const slug = m.county.slug;
      const structured = {
        countySlug: slug,
        countyDisplayName: displayName,
        totalRegisteredCount: m.totalRegisteredCount,
        newRegistrationsSinceBaseline: m.newRegistrationsSinceBaseline,
        newRegistrationsSincePreviousSnapshot: m.newRegistrationsSincePreviousSnapshot,
        droppedSincePreviousSnapshot: m.droppedSincePreviousSnapshot,
        netChangeSincePreviousSnapshot: m.netChangeSincePreviousSnapshot,
        countyGoal: m.countyGoal,
        progressPercent: m.progressPercent,
        registrationBaselineDate: toIso(m.registrationBaselineDate),
      };
      const plainText = buildCountyPlainText({
        displayName,
        slug,
        asOfDateIso: asOfIso,
        totalRegisteredCount: m.totalRegisteredCount,
        newRegistrationsSinceBaseline: m.newRegistrationsSinceBaseline,
        newRegistrationsSincePreviousSnapshot: m.newRegistrationsSincePreviousSnapshot,
        droppedSincePreviousSnapshot: m.droppedSincePreviousSnapshot,
        netChangeSincePreviousSnapshot: m.netChangeSincePreviousSnapshot,
        countyGoal: m.countyGoal,
        progressPercent: m.progressPercent,
      });
      chunks.push({
        id: `vm::agg::county::${slug}::${snapshot.id}`,
        tier: "AGGREGATE_COUNTY",
        snapshotId: snapshot.id,
        fileAsOfDateIso: asOfIso,
        countySlug: slug,
        countyDisplayName: displayName,
        structured,
        plainText,
      });
    }

    if (!filters?.countySlug && metrics.length > 0) {
      let sumTotal = 0;
      let sumNewBase = 0;
      let sumNet = 0;
      for (const m of metrics) {
        sumTotal += m.totalRegisteredCount ?? 0;
        sumNewBase += m.newRegistrationsSinceBaseline;
        sumNet += m.netChangeSincePreviousSnapshot;
      }

      chunks.unshift({
        id: `vm::agg::state::${snapshot.id}`,
        tier: "AGGREGATE_STATE",
        snapshotId: snapshot.id,
        fileAsOfDateIso: asOfIso,
        structured: {
          countyRows: metrics.length,
          sumTotalRegisteredCount: sumTotal,
          sumNewRegistrationsSinceBaseline: sumNewBase,
          sumNetChangeSincePreviousSnapshot: sumNet,
        },
        plainText: buildStatePlainText({
          asOfDateIso: asOfIso,
          countyCount: metrics.length,
          sumTotalRegistered: sumTotal,
          sumNewBaseline: sumNewBase,
          sumNetSincePrev: sumNet,
        }),
      });
    }

    return {
      ok: true,
      snapshotId: snapshot.id,
      fileAsOfDateIso: asOfIso,
      rowCountProcessed: snapshot.rowCountProcessed,
      chunks,
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
      return { ok: false, reason: "schema_tables_missing", message: e.message };
    }
    const message = e instanceof Error ? e.message : "unknown";
    return { ok: false, reason: "query_failed", message };
  }
}
