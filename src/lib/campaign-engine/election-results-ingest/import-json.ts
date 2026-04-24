/**
 * DATA-4 + ELECTION-INGEST-1: load one Arkansas election results JSON file into Prisma.
 * Variant-aware; preserves fragments in metadataJson; does not normalize precinct keys.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { Prisma, ElectionResultSourceType, type PrismaClient } from "@prisma/client";
import {
  ELECTION_INGEST_PARSER_LEGACY,
  ELECTION_INGEST_PARSER_PREFERENTIAL,
  type ElectionIngestParserVariant,
  detectArkansasElectionJsonVariant,
} from "./variants";

export type ElectionJsonImportSummary = {
  filePath: string;
  parserVariant: ElectionIngestParserVariant | "skipped" | "unknown";
  dryRun: boolean;
  replacedExistingSourceId: string | null;
  sourceId: string | null;
  filesProcessed: number;
  sourcesCreated: number;
  contestsCreated: number;
  countyRowsCreated: number;
  precinctRowsCreated: number;
  candidateRowsCreated: number;
  precinctCandidateRowsCreated: number;
  unmatchedCountyNames: string[];
};

type CountyRow = { id: string; displayName: string; fips: string; slug: string };

export type CountyMatchIndex = {
  byFips: Map<string, string>;
  byNormName: Map<string, string>;
};

export function buildCountyMatchIndex(counties: CountyRow[]): CountyMatchIndex {
  const byFips = new Map<string, string>();
  const byNormName = new Map<string, string>();
  for (const c of counties) {
    byFips.set(normalizeFips(c.fips), c.id);
    const up = normCountyName(c.displayName);
    byNormName.set(up, c.id);
    byNormName.set(up.replace(/\s+COUNTY$/i, "").trim(), c.id);
    byNormName.set(c.slug.toUpperCase().replace(/-/g, " "), c.id);
  }
  return { byFips, byNormName };
}

export function normalizeFips(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return raw;
  return digits.length <= 5 ? digits.padStart(5, "0") : digits.slice(-5);
}

export function normCountyName(s: string): string {
  return s
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function matchCountyId(
  rawName: string | null | undefined,
  fipsHint: string | null | undefined,
  idx: CountyMatchIndex,
  unmatched: Set<string>,
): string | null {
  if (fipsHint) {
    const id = idx.byFips.get(normalizeFips(fipsHint));
    if (id) return id;
  }
  if (!rawName) return null;
  const n = normCountyName(rawName);
  if (n === "ARKANSAS" || n === "STATEWIDE" || n === "ALL") return null;
  const id =
    idx.byNormName.get(n) ??
    idx.byNormName.get(n.replace(/\s+COUNTY$/i, "").trim()) ??
    null;
  if (id) return id;
  unmatched.add(rawName);
  return null;
}

function dec(n: unknown): Prisma.Decimal | null {
  if (n == null || n === "") return null;
  const x = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(x)) return null;
  return new Prisma.Decimal(x);
}

function parseWhen(s: unknown): Date {
  if (typeof s !== "string") return new Date();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

async function removeSourceChain(tx: Prisma.TransactionClient, sourceId: string) {
  await tx.electionResultSource.delete({ where: { id: sourceId } });
}

export async function importElectionResultsJsonFile(options: {
  prisma: PrismaClient;
  absolutePath: string;
  sourceNameFallback: string;
  dryRun: boolean;
  replace: boolean;
}): Promise<ElectionJsonImportSummary> {
  const { prisma, absolutePath, sourceNameFallback, dryRun, replace } = options;

  const summary: ElectionJsonImportSummary = {
    filePath: absolutePath,
    parserVariant: "unknown",
    dryRun,
    replacedExistingSourceId: null,
    sourceId: null,
    filesProcessed: 1,
    sourcesCreated: 0,
    contestsCreated: 0,
    countyRowsCreated: 0,
    precinctRowsCreated: 0,
    candidateRowsCreated: 0,
    precinctCandidateRowsCreated: 0,
    unmatchedCountyNames: [],
  };

  const bytes = readFileSync(absolutePath);
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  const text = bytes.toString("utf8");
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    summary.parserVariant = "unknown";
    return summary;
  }

  const variant = detectArkansasElectionJsonVariant(json);
  if (!variant) {
    summary.parserVariant = "unknown";
    return summary;
  }
  summary.parserVariant = variant;

  const unmatched = new Set<string>();
  const counties = await prisma.county.findMany({
    select: { id: true, displayName: true, fips: true, slug: true },
  });
  const idx = buildCountyMatchIndex(counties);

  const existing = await prisma.electionResultSource.findFirst({
    where: { sourcePath: absolutePath },
    select: { id: true },
  });

  if (existing && !replace) {
    summary.parserVariant = "skipped";
    summary.sourceId = existing.id;
    return summary;
  }

  if (dryRun) {
    if (variant === ELECTION_INGEST_PARSER_LEGACY) {
      const j = json as LegacyRoot;
      summary.contestsCreated = j.ContestData?.length ?? 0;
      summary.countyRowsCreated =
        (j.Turnout?.CountyTurnout?.length ?? 0) +
        estimateLegacyCountyRows(j.ContestData);
      summary.precinctRowsCreated = estimateLegacyPrecinctRows(j.ContestData);
    } else {
      const j = json as PrefRoot;
      summary.contestsCreated = j.ContestData?.length ?? 0;
      summary.countyRowsCreated =
        Object.keys(j.TurnoutData?.Locations ?? {}).length + estimatePrefCountyRows(j.ContestData);
      summary.precinctRowsCreated = estimatePrefPrecinctTurnout(j.TurnoutData);
    }
    summary.candidateRowsCreated = -1;
    summary.precinctCandidateRowsCreated = -1;
    summary.unmatchedCountyNames = [];
    return summary;
  }

  await prisma.$transaction(async (tx) => {
    if (existing && replace) {
      await removeSourceChain(tx, existing.id);
      summary.replacedExistingSourceId = existing.id;
    }

    if (variant === ELECTION_INGEST_PARSER_LEGACY) {
      await ingestLegacy(tx, json as LegacyRoot, {
        absolutePath,
        sourceNameFallback,
        fileHash,
        idx,
        unmatched,
        summary,
      });
    } else {
      await ingestPreferential(tx, json as PrefRoot, {
        absolutePath,
        sourceNameFallback,
        fileHash,
        idx,
        unmatched,
        summary,
      });
    }
  });

  summary.unmatchedCountyNames = [...unmatched].sort();
  return summary;
}

function estimateLegacyCountyRows(contests: LegacyContest[] | undefined): number {
  if (!Array.isArray(contests)) return 0;
  let n = 0;
  for (const c of contests) {
    n += c.Counties?.length ?? 0;
  }
  return n;
}

function estimateLegacyPrecinctRows(contests: LegacyContest[] | undefined): number {
  if (!Array.isArray(contests)) return 0;
  let n = 0;
  for (const c of contests) {
    for (const cy of c.Counties ?? []) {
      n += cy.Precincts?.length ?? 0;
    }
  }
  return n;
}

function estimatePrefCountyRows(contests: PrefContest[] | undefined): number {
  if (!Array.isArray(contests)) return 0;
  let n = 0;
  for (const c of contests) {
    if (c.Locations && typeof c.Locations === "object" && !Array.isArray(c.Locations)) {
      n += Object.keys(c.Locations as object).length;
    }
  }
  return n;
}

function estimatePrefPrecinctTurnout(td: PrefTurnout | undefined): number {
  if (!td?.Locations || typeof td.Locations !== "object") return 0;
  let n = 0;
  for (const loc of Object.values(td.Locations)) {
    if (loc?.Locations && typeof loc.Locations === "object") {
      n += Object.keys(loc.Locations).length;
    }
  }
  return n;
}

// --- Legacy types (loose) ---

type LegacyRoot = {
  ElectionInfo: {
    ElectionID?: string;
    ElectionName?: string;
    ElectionDate?: string;
    IsOfficial?: boolean;
  };
  Turnout: {
    VotesCast?: number;
    RegisteredVoters?: number;
    VotePercent?: number;
    CountyTurnout?: Array<{
      CountyName?: string;
      VotesCast?: number;
      RegisteredVoters?: number;
      VotePercent?: number;
      ReportingPercent?: number;
      PrecinctsReporting?: number;
      TotalPrecincts?: number;
    }>;
  };
  ContestData: LegacyContest[];
};

type LegacyContest = {
  ContestName?: string;
  TotalVotes?: number;
  PrecinctsReporting?: number;
  TotalPrecincts?: number;
  Candidates?: Array<{ Name?: string; PartyName?: string; TotalVotes?: number }>;
  Counties?: LegacyCounty[];
  metadata?: unknown;
};

type LegacyCounty = {
  CountyName?: string;
  TotalVotes?: number;
  ReportingPercent?: number;
  PrecinctsReporting?: number;
  TotalPrecincts?: number;
  Candidates?: Array<{ Name?: string; PartyName?: string; TotalVotes?: number }>;
  Precincts?: Array<{
    PrecinctName?: string;
    TotalVotes?: number;
    Candidates?: Array<{ Name?: string; PartyName?: string; TotalVotes?: number }>;
  }>;
};

async function ingestLegacy(
  tx: Prisma.TransactionClient,
  j: LegacyRoot,
  ctx: {
    absolutePath: string;
    sourceNameFallback: string;
    fileHash: string;
    idx: CountyMatchIndex;
    unmatched: Set<string>;
    summary: ElectionJsonImportSummary;
  },
) {
  const ei = j.ElectionInfo ?? {};
  const electionDate = parseWhen(ei.ElectionDate);
  const src = await tx.electionResultSource.create({
    data: {
      sourceName: ei.ElectionName ?? ctx.sourceNameFallback,
      sourcePath: ctx.absolutePath,
      sourceType: ElectionResultSourceType.JSON_FILE,
      electionName: ei.ElectionName ?? ctx.sourceNameFallback,
      electionDate,
      electionIdExternal: ei.ElectionID ?? null,
      isOfficial: ei.IsOfficial ?? null,
      parserVariant: ELECTION_INGEST_PARSER_LEGACY,
      metadataJson: {
        fileSha256: ctx.fileHash,
        topLevelTurnout: j.Turnout,
      } as Prisma.InputJsonValue,
    },
  });
  ctx.summary.sourceId = src.id;
  ctx.summary.sourcesCreated = 1;

  for (const row of j.Turnout?.CountyTurnout ?? []) {
    const cid = matchCountyId(row.CountyName, null, ctx.idx, ctx.unmatched);
    await tx.electionCountyResult.create({
      data: {
        sourceId: src.id,
        contestId: null,
        countyId: cid,
        countyNameRaw: row.CountyName ?? "Unknown",
        countyFips: null,
        totalVotes: null,
        registeredVoters: row.RegisteredVoters ?? null,
        ballotsCast: row.VotesCast ?? null,
        votePercent: dec(row.VotePercent),
        reportingPercent: dec(row.ReportingPercent),
        metadataJson: { kind: "legacy_turnout_county" } as Prisma.InputJsonValue,
      },
    });
    ctx.summary.countyRowsCreated += 1;
  }

  for (const contest of j.ContestData ?? []) {
    const cname = contest.ContestName ?? "Unknown contest";
    const er = await tx.electionContestResult.create({
      data: {
        sourceId: src.id,
        contestName: cname,
        contestType: null,
        jurisdictionLevel: "state",
        totalVotes: contest.TotalVotes ?? null,
        metadataJson: {
          PrecinctsReporting: contest.PrecinctsReporting,
          TotalPrecincts: contest.TotalPrecincts,
        } as Prisma.InputJsonValue,
      },
    });
    ctx.summary.contestsCreated += 1;

    for (const cand of contest.Candidates ?? []) {
      await tx.electionCandidateResult.create({
        data: {
          contestId: er.id,
          countyResultId: null,
          candidateName: cand.Name ?? "Unknown",
          partyName: cand.PartyName ?? null,
          totalVotes: cand.TotalVotes ?? 0,
          metadataJson: { scope: "statewide" } as Prisma.InputJsonValue,
        },
      });
      ctx.summary.candidateRowsCreated += 1;
    }

    for (const cy of contest.Counties ?? []) {
      const cid = matchCountyId(cy.CountyName, null, ctx.idx, ctx.unmatched);
      const countyRow = await tx.electionCountyResult.create({
        data: {
          sourceId: src.id,
          contestId: er.id,
          countyId: cid,
          countyNameRaw: cy.CountyName ?? "Unknown",
          countyFips: null,
          totalVotes: cy.TotalVotes ?? null,
          registeredVoters: null,
          ballotsCast: null,
          votePercent: null,
          reportingPercent: dec(cy.ReportingPercent),
          metadataJson: {
            kind: "legacy_contest_county",
            PrecinctsReporting: cy.PrecinctsReporting,
            TotalPrecincts: cy.TotalPrecincts,
          } as Prisma.InputJsonValue,
        },
      });
      ctx.summary.countyRowsCreated += 1;

      for (const cand of cy.Candidates ?? []) {
        await tx.electionCandidateResult.create({
          data: {
            contestId: er.id,
            countyResultId: countyRow.id,
            candidateName: cand.Name ?? "Unknown",
            partyName: cand.PartyName ?? null,
            totalVotes: cand.TotalVotes ?? 0,
            metadataJson: { scope: "county" } as Prisma.InputJsonValue,
          },
        });
        ctx.summary.candidateRowsCreated += 1;
      }

      for (const pr of cy.Precincts ?? []) {
        const prec = await tx.electionPrecinctResult.create({
          data: {
            sourceId: src.id,
            contestId: er.id,
            countyId: cid,
            countyNameRaw: cy.CountyName ?? null,
            countyFips: null,
            precinctNameRaw: pr.PrecinctName ?? null,
            precinctExternalId: null,
            totalVotes: pr.TotalVotes ?? null,
            registeredVoters: null,
            ballotsCast: null,
            votePercent: null,
            metadataJson: { kind: "legacy_precinct" } as Prisma.InputJsonValue,
          },
        });
        ctx.summary.precinctRowsCreated += 1;
        for (const cand of pr.Candidates ?? []) {
          await tx.electionPrecinctCandidateResult.create({
            data: {
              precinctResultId: prec.id,
              candidateName: cand.Name ?? "Unknown",
              partyName: cand.PartyName ?? null,
              totalVotes: cand.TotalVotes ?? 0,
              metadataJson: {} as Prisma.InputJsonValue,
            },
          });
          ctx.summary.precinctCandidateRowsCreated += 1;
        }
      }
    }
  }
}

// --- Preferential types ---

type PrefRoot = {
  ElectionData: {
    ElectionID?: string;
    ElectionMessage?: string | null;
    IsOfficial?: boolean;
  };
  TurnoutData: PrefTurnout;
  ContestData: PrefContest[];
};

type PrefTurnout = {
  RegisteredVoters?: number;
  TotalBallotsCast?: number;
  ReportingPercent?: number;
  VotePercent?: number;
  Locations?: Record<
    string,
    {
      LocationID?: string;
      RegisteredVoters?: number;
      TotalBallotsCast?: number;
      VotePercent?: number;
      ReportingPercent?: number;
      Locations?: Record<
        string,
        {
          LocationID?: string;
          RegisteredVoters?: number;
          TotalBallotsCast?: number;
        }
      >;
    }
  >;
};

type PrefContest = {
  ContestID?: string;
  ContestName?: string;
  TotalVotes?: number;
  HasLocationResults?: boolean;
  Choices?: Array<{
    ChoiceID?: string;
    TotalVotes?: number;
    PartyID?: string;
    VotePercent?: number;
  }>;
  Locations?: Record<string, PrefLocationAgg>;
};

type PrefLocationAgg = {
  LocationID?: string;
  TotalVotes?: number;
  Choices?: Array<{
    ChoiceID?: string;
    TotalVotes?: number;
    PartyID?: string;
    VotePercent?: number;
  }>;
};

function choiceLabel(c: { ChoiceID?: string }): string {
  const id = c.ChoiceID ?? "unknown";
  return `choice:${id}`;
}

async function ingestPreferential(
  tx: Prisma.TransactionClient,
  j: PrefRoot,
  ctx: {
    absolutePath: string;
    sourceNameFallback: string;
    fileHash: string;
    idx: CountyMatchIndex;
    unmatched: Set<string>;
    summary: ElectionJsonImportSummary;
  },
) {
  const ed = j.ElectionData ?? {};
  const src = await tx.electionResultSource.create({
    data: {
      sourceName: ctx.sourceNameFallback,
      sourcePath: ctx.absolutePath,
      sourceType: ElectionResultSourceType.JSON_FILE,
      electionName: ctx.sourceNameFallback,
      electionDate: new Date(),
      electionIdExternal: ed.ElectionID ?? null,
      isOfficial: ed.IsOfficial ?? null,
      parserVariant: ELECTION_INGEST_PARSER_PREFERENTIAL,
      metadataJson: {
        fileSha256: ctx.fileHash,
        electionData: ed,
        turnoutDataTop: {
          RegisteredVoters: j.TurnoutData?.RegisteredVoters,
          TotalBallotsCast: j.TurnoutData?.TotalBallotsCast,
          ReportingPercent: j.TurnoutData?.ReportingPercent,
        },
      } as Prisma.InputJsonValue,
    },
  });
  ctx.summary.sourceId = src.id;
  ctx.summary.sourcesCreated = 1;

  for (const [fipsKey, loc] of Object.entries(j.TurnoutData?.Locations ?? {})) {
    const cid = matchCountyId(null, fipsKey, ctx.idx, ctx.unmatched);
    await tx.electionCountyResult.create({
      data: {
        sourceId: src.id,
        contestId: null,
        countyId: cid,
        countyNameRaw: fipsKey,
        countyFips: normalizeFips(fipsKey),
        totalVotes: null,
        registeredVoters: loc.RegisteredVoters ?? null,
        ballotsCast: loc.TotalBallotsCast ?? null,
        votePercent: dec(loc.VotePercent),
        reportingPercent: dec(loc.ReportingPercent),
        metadataJson: { kind: "preferential_turnout_county", LocationID: loc.LocationID } as Prisma.InputJsonValue,
      },
    });
    ctx.summary.countyRowsCreated += 1;

    for (const [subId, sub] of Object.entries(loc.Locations ?? {})) {
      await tx.electionPrecinctResult.create({
        data: {
          sourceId: src.id,
          contestId: null,
          countyId: cid,
          countyNameRaw: fipsKey,
          countyFips: normalizeFips(fipsKey),
          precinctNameRaw: null,
          precinctExternalId: sub.LocationID ?? subId,
          totalVotes: null,
          registeredVoters: sub.RegisteredVoters ?? null,
          ballotsCast: sub.TotalBallotsCast ?? null,
          votePercent: null,
          metadataJson: {
            kind: "preferential_turnout_sub_location",
            parentFips: fipsKey,
          } as Prisma.InputJsonValue,
        },
      });
      ctx.summary.precinctRowsCreated += 1;
    }
  }

  for (const contest of j.ContestData ?? []) {
    const cname =
      contest.ContestName ??
      (contest.ContestID != null ? `Contest ${contest.ContestID}` : "Unknown contest");
    const er = await tx.electionContestResult.create({
      data: {
        sourceId: src.id,
        contestName: String(cname),
        contestType: null,
        jurisdictionLevel: "state",
        totalVotes: contest.TotalVotes ?? null,
        metadataJson: {
          ContestID: contest.ContestID,
          HasLocationResults: contest.HasLocationResults,
        } as Prisma.InputJsonValue,
      },
    });
    ctx.summary.contestsCreated += 1;

    for (const ch of contest.Choices ?? []) {
      await tx.electionCandidateResult.create({
        data: {
          contestId: er.id,
          countyResultId: null,
          candidateName: choiceLabel(ch),
          partyName: ch.PartyID ?? null,
          totalVotes: ch.TotalVotes ?? 0,
          metadataJson: {
            scope: "statewide",
            ChoiceID: ch.ChoiceID,
            VotePercent: ch.VotePercent,
          } as Prisma.InputJsonValue,
        },
      });
      ctx.summary.candidateRowsCreated += 1;
    }

    const locs = contest.Locations;
    if (locs && typeof locs === "object" && !Array.isArray(locs)) {
      for (const [fipsKey, block] of Object.entries(locs)) {
        const cid = matchCountyId(null, fipsKey, ctx.idx, ctx.unmatched);
        const countyRow = await tx.electionCountyResult.create({
          data: {
            sourceId: src.id,
            contestId: er.id,
            countyId: cid,
            countyNameRaw: fipsKey,
            countyFips: normalizeFips(fipsKey),
            totalVotes: block.TotalVotes ?? null,
            registeredVoters: null,
            ballotsCast: null,
            votePercent: null,
            reportingPercent: null,
            metadataJson: {
              kind: "preferential_contest_location",
              LocationID: block.LocationID,
            } as Prisma.InputJsonValue,
          },
        });
        ctx.summary.countyRowsCreated += 1;
        for (const ch of block.Choices ?? []) {
          await tx.electionCandidateResult.create({
            data: {
              contestId: er.id,
              countyResultId: countyRow.id,
              candidateName: choiceLabel(ch),
              partyName: ch.PartyID ?? null,
              totalVotes: ch.TotalVotes ?? 0,
              metadataJson: {
                scope: "county_location",
                ChoiceID: ch.ChoiceID,
                VotePercent: ch.VotePercent,
              } as Prisma.InputJsonValue,
            },
          });
          ctx.summary.candidateRowsCreated += 1;
        }
      }
    }
  }
}
