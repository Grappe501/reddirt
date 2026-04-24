/**
 * DATA-4 + ELECTION-INGEST-1: read-only election results helpers (no targeting math).
 */
import { prisma } from "@/lib/db";

export const DATA4_PACKET = "DATA-4" as const;
export const ELECTION_INGEST1_PACKET = "ELECTION-INGEST-1" as const;

export type ElectionResultCoverageSummary = {
  sourceCount: number;
  contestCount: number;
  countyResultRowCount: number;
  countyResultsWithCountyId: number;
  precinctResultRowCount: number;
  latestElectionDate: Date | null;
  /** Distinct County.id linked from county-level results (any contest or turnout-only). */
  distinctMappedCountyIds: number;
};

export async function listElectionResultSources(limit = 100) {
  return prisma.electionResultSource.findMany({
    orderBy: { electionDate: "desc" },
    take: limit,
    select: {
      id: true,
      sourceName: true,
      sourcePath: true,
      sourceType: true,
      electionName: true,
      electionDate: true,
      electionIdExternal: true,
      isOfficial: true,
      parserVariant: true,
      importedAt: true,
    },
  });
}

export async function getElectionResultCoverageSummary(): Promise<ElectionResultCoverageSummary> {
  const [
    sourceCount,
    contestCount,
    countyResultRowCount,
    countyResultsWithCountyId,
    precinctResultRowCount,
    latest,
    distinctCounty,
  ] = await Promise.all([
    prisma.electionResultSource.count(),
    prisma.electionContestResult.count(),
    prisma.electionCountyResult.count(),
    prisma.electionCountyResult.count({ where: { countyId: { not: null } } }),
    prisma.electionPrecinctResult.count(),
    prisma.electionResultSource.findFirst({
      orderBy: { electionDate: "desc" },
      select: { electionDate: true },
    }),
    prisma.electionCountyResult.groupBy({
      by: ["countyId"],
      where: { countyId: { not: null } },
    }),
  ]);

  return {
    sourceCount,
    contestCount,
    countyResultRowCount,
    countyResultsWithCountyId,
    precinctResultRowCount,
    latestElectionDate: latest?.electionDate ?? null,
    distinctMappedCountyIds: distinctCounty.filter((g) => g.countyId != null).length,
  };
}

/** County-scoped result rows (contest + turnout slices) for one County.id — narrow list for dashboards. */
export async function listCountyElectionResults(countyId: string, limit = 200) {
  return prisma.electionCountyResult.findMany({
    where: { countyId },
    orderBy: [{ updatedAt: "desc" }],
    take: limit,
    include: {
      source: {
        select: {
          id: true,
          electionName: true,
          electionDate: true,
          isOfficial: true,
          parserVariant: true,
        },
      },
      contest: {
        select: { id: true, contestName: true, totalVotes: true },
      },
    },
  });
}

export async function getCountyElectionResultSummary(countyId: string) {
  const [totalRows, withContest, sources] = await Promise.all([
    prisma.electionCountyResult.count({ where: { countyId } }),
    prisma.electionCountyResult.count({ where: { countyId, contestId: { not: null } } }),
    prisma.electionCountyResult.findMany({
      where: { countyId },
      distinct: ["sourceId"],
      select: { sourceId: true },
    }),
  ]);

  return {
    countyId,
    countyResultRows: totalRows,
    rowsLinkedToContest: withContest,
    distinctSources: sources.length,
  };
}
