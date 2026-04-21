import { VoterFileIngestStatus, VoterSnapshotChangeType, type VoterRecord } from "@prisma/client";
import { markVoterFileSnapshotStatus } from "./ingest-voter-snapshot";
import {
  readFileBytesWithMeta,
  normalizeCountyFips,
  parseSosVoterFileContent,
  type ParsedSosVoterRow,
} from "./sos-voter-csv";
import { recomputeAllCountyVoterMetricsForSnapshot } from "./recompute-county-voter-metrics";
import { createSnapshotRecord } from "./snapshot-pipeline";
import { prisma } from "@/lib/db";

const UPSERT_BATCH = 80;
const CHANGE_INSERT_BATCH = 1_000;
const REMOVED_KEY_CHUNK = 400;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export type RunVoterFileImportInput = {
  /** Raw file path (read as UTF-8) */
  filePath: string;
  /** “As of” for this voter roll file */
  fileAsOfDate: Date;
  fileReceivedAt?: Date;
  /** Extra operator notes; pipeline appends import stats */
  operatorNotes?: string;
};

export type RunVoterFileImportResult = {
  snapshotId: string;
  sourceFileHash: string;
  rowCountInFile: number;
  rowCountProcessed: number;
  errorLineCount: number;
  unmappedFipsCount: number;
  removedCount: number;
  newCount: number;
  reactivatedCount: number;
};

/**
 * End-to-end import: `VoterFileSnapshot` (status lifecycle) → `VoterRecord` upserts →
 * `VoterSnapshotChange` (NEW / REACTIVATED / REMOVED) → `CountyVoterMetrics` + `CountyCampaignStats`.
 */
export async function runVoterFileImportFromFile(input: RunVoterFileImportInput): Promise<RunVoterFileImportResult> {
  const { sourceFileHash, sourceFilename, buffer } = await readFileBytesWithMeta(input.filePath);
  return runVoterFileImportFromBuffer({
    ...input,
    buffer,
    sourceFileHash,
    sourceFilename,
  });
}

type BufferInput = RunVoterFileImportInput & {
  buffer: Buffer;
  sourceFileHash: string;
  sourceFilename: string;
};

export async function runVoterFileImportFromBuffer(
  input: BufferInput
): Promise<RunVoterFileImportResult> {
  const withHash = await prisma.voterFileSnapshot.findFirst({
    where: { sourceFileHash: input.sourceFileHash },
  });
  if (withHash?.status === VoterFileIngestStatus.COMPLETE) {
    throw new Error(
      `This file (SHA-256 match) is already imported as a completed snapshot: ${withHash.id} (${withHash.fileAsOfDate.toISOString()})`
    );
  }
  if (withHash?.status === VoterFileIngestStatus.FAILED) {
    throw new Error(
      `A prior import with the same file hash failed (snapshot ${withHash.id}). Delete or repurpose that row in the database (and fix partial voter data if any) before retrying, or use a different file.`
    );
  }

  const prev = await prisma.voterFileSnapshot.findFirst({
    where: { status: VoterFileIngestStatus.COMPLETE },
    orderBy: { fileAsOfDate: "desc" },
  });

  const previousSnapshotId = prev?.id ?? null;

  const notesParts: string[] = [];
  if (input.operatorNotes?.trim()) notesParts.push(input.operatorNotes.trim());

  const snapshotId = await createSnapshotRecord({
    fileAsOfDate: input.fileAsOfDate,
    sourceFilename: input.sourceFilename,
    sourceFileHash: input.sourceFileHash,
    fileReceivedAt: input.fileReceivedAt,
    previousSnapshotId,
  });

  try {
    await markVoterFileSnapshotStatus(snapshotId, VoterFileIngestStatus.PROCESSING, null);
    const text = input.buffer.toString("utf-8");
    const parsed = parseSosVoterFileContent(text);
    if (parsed.badLines.length > 0 && parsed.byKey.size === 0) {
      const msg = parsed.badLines.map((b) => `L${b.line}: ${b.reason}`).join("; ");
      throw new Error(`File parse / header: ${msg}`);
    }

    if (parsed.duplicateKeyCount > 0) {
      notesParts.push(`Merged ${parsed.duplicateKeyCount} duplicate VOTER_ID line(s) (last row wins).`);
    }

    const counties = await prisma.county.findMany({ select: { id: true, fips: true, slug: true } });
    const fipsToCounty = new Map(counties.map((c) => [c.fips, c] as const));

    const byKey = parsed.byKey;
    const allKeys = [...byKey.keys()];

    const existingRows = allKeys.length
      ? await prisma.voterRecord.findMany({
          where: { voterFileKey: { in: allKeys } },
        })
      : [];
    const existingByKey = new Map<string, VoterRecord>(existingRows.map((r) => [r.voterFileKey, r]));

    let prevInRoll = new Set<string>();
    if (previousSnapshotId) {
      const prevList = await prisma.voterRecord.findMany({
        where: {
          lastSeenSnapshotId: previousSnapshotId,
          inLatestCompletedFile: true,
        },
        select: { voterFileKey: true },
      });
      prevInRoll = new Set(prevList.map((p) => p.voterFileKey));
    }

    type Prepared = {
      row: ParsedSosVoterRow;
      county: { id: string; fips: string; slug: string };
      change: "NEW" | "REACTIVATED" | null;
    };
    const prepared: Prepared[] = [];
    const skippedBadFips: { key: string; fips: string; line: number }[] = [];

    for (const [key, row] of byKey) {
      const nf = normalizeCountyFips(row.countyFipsRaw);
      if (!nf) {
        skippedBadFips.push({ key, fips: row.countyFipsRaw, line: row.lineNumber });
        continue;
      }
      const county = fipsToCounty.get(nf);
      if (!county) {
        skippedBadFips.push({ key, fips: nf, line: row.lineNumber });
        continue;
      }
      const ex = existingByKey.get(key);
      let change: "NEW" | "REACTIVATED" | null = null;
      if (!ex) {
        change = "NEW";
      } else if (!ex.inLatestCompletedFile) {
        change = "REACTIVATED";
      } else {
        change = null;
      }
      prepared.push({ row, county, change });
    }

    if (skippedBadFips.length > 0) {
      notesParts.push(
        `Skipped ${skippedBadFips.length} row(s) with unknown/invalid FIPS (see errorMessage summary).`
      );
    }
    if (parsed.badLines.length > 0) {
      const sample = parsed.badLines.slice(0, 5);
      notesParts.push(
        `Parse warnings: ${sample.map((b) => `L${b.line}`).join(", ")}${parsed.badLines.length > 5 ? "…" : ""} (${parsed.badLines.length} total bad lines, often empty id).`
      );
    }

    let newCount = 0;
    let reactivatedCount = 0;
    for (const p of prepared) {
      if (p.change === "NEW") newCount += 1;
      if (p.change === "REACTIVATED") reactivatedCount += 1;
    }

    for (const part of chunkArray(prepared, UPSERT_BATCH)) {
      await prisma.$transaction(
        part.map((p) => {
          const { row, county } = p;
          return prisma.voterRecord.upsert({
            where: { voterFileKey: row.voterFileKey },
            create: {
              voterFileKey: row.voterFileKey,
              countyFips: county.fips,
              countyId: county.id,
              countySlug: county.slug,
              registrationDate: row.registrationDate,
              city: row.city,
              precinct: row.precinct,
              firstName: row.firstName,
              lastName: row.lastName,
              phone10: row.phone10,
              firstSeenSnapshotId: snapshotId,
              lastSeenSnapshotId: snapshotId,
              inLatestCompletedFile: true,
              updatedFromSnapshotId: snapshotId,
              droppedAtSnapshotId: null,
              droppedOffAt: null,
            },
            update: {
              countyFips: county.fips,
              countyId: county.id,
              countySlug: county.slug,
              registrationDate: row.registrationDate,
              city: row.city,
              precinct: row.precinct,
              firstName: row.firstName,
              lastName: row.lastName,
              phone10: row.phone10,
              lastSeenSnapshotId: snapshotId,
              inLatestCompletedFile: true,
              updatedFromSnapshotId: snapshotId,
              droppedAtSnapshotId: null,
              droppedOffAt: null,
            },
          });
        })
      );
    }

    // Anyone listed in the raw file (by voter id) counts as "present" for drop logic — even if we skip
    // the row for unmapped FIPS, we do not mark them REMOVED (operator should fix the row).
    const keysInFile = new Set(allKeys);
    const removedFromRoll = previousSnapshotId
      ? [...prevInRoll].filter((k) => !keysInFile.has(k))
      : [];

    for (const rk of chunkArray(removedFromRoll, REMOVED_KEY_CHUNK)) {
      await prisma.voterRecord.updateMany({
        where: { voterFileKey: { in: rk } },
        data: {
          inLatestCompletedFile: false,
          droppedAtSnapshotId: snapshotId,
          droppedOffAt: input.fileAsOfDate,
        },
      });
    }

    const changeRows: { voterFileKey: string; changeType: VoterSnapshotChangeType; countyId: string; countySlug: string; summaryJson: object }[] = [];

    for (const p of prepared) {
      if (p.change === "NEW") {
        changeRows.push({
          voterFileKey: p.row.voterFileKey,
          changeType: VoterSnapshotChangeType.NEW,
          countyId: p.county.id,
          countySlug: p.county.slug,
          summaryJson: { line: p.row.lineNumber },
        });
      } else if (p.change === "REACTIVATED") {
        changeRows.push({
          voterFileKey: p.row.voterFileKey,
          changeType: VoterSnapshotChangeType.REACTIVATED,
          countyId: p.county.id,
          countySlug: p.county.slug,
          summaryJson: { line: p.row.lineNumber },
        });
      }
    }

    if (removedFromRoll.length) {
      const remRows = await prisma.voterRecord.findMany({
        where: { voterFileKey: { in: removedFromRoll } },
        select: { id: true, voterFileKey: true, countyId: true, countySlug: true },
      });
      for (const v of remRows) {
        changeRows.push({
          voterFileKey: v.voterFileKey,
          changeType: VoterSnapshotChangeType.REMOVED,
          countyId: v.countyId,
          countySlug: v.countySlug,
          summaryJson: { previousSnapshotId },
        });
      }
    }

    const presentIdRows = await prisma.voterRecord.findMany({
      where: { voterFileKey: { in: allKeys } },
      select: { id: true, voterFileKey: true },
    });
    const removedIdRows = removedFromRoll.length
      ? await prisma.voterRecord.findMany({
          where: { voterFileKey: { in: removedFromRoll } },
          select: { id: true, voterFileKey: true },
        })
      : [];
    const idMap = new Map(
      [...presentIdRows, ...removedIdRows].map((r) => [r.voterFileKey, r.id] as const)
    );

    for (const cPart of chunkArray(changeRows, CHANGE_INSERT_BATCH)) {
      await prisma.voterSnapshotChange.createMany({
        data: cPart.map((c) => ({
          voterFileSnapshotId: snapshotId,
          voterFileKey: c.voterFileKey,
          voterRecordId: idMap.get(c.voterFileKey) ?? null,
          changeType: c.changeType,
          countyId: c.countyId,
          countySlug: c.countySlug,
          summaryJson: c.summaryJson,
        })),
      });
    }

    await recomputeAllCountyVoterMetricsForSnapshot(snapshotId);

    const errSummary =
      skippedBadFips.length > 0
        ? `unmapped fips: ${skippedBadFips
            .slice(0, 3)
            .map((s) => `${s.fips}@L${s.line}`)
            .join(", ")}${skippedBadFips.length > 3 ? "…" : ""}`
        : null;

    await prisma.voterFileSnapshot.update({
      where: { id: snapshotId },
      data: {
        status: VoterFileIngestStatus.COMPLETE,
        errorMessage: errSummary,
        rowCountProcessed: prepared.length,
        operatorNotes: notesParts.length > 0 ? notesParts.join("\n") : null,
      },
    });

    return {
      snapshotId,
      sourceFileHash: input.sourceFileHash,
      rowCountInFile: parsed.rowCount,
      rowCountProcessed: prepared.length,
      errorLineCount: parsed.badLines.length + skippedBadFips.length,
      unmappedFipsCount: skippedBadFips.length,
      removedCount: removedFromRoll.length,
      newCount,
      reactivatedCount,
    };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    await markVoterFileSnapshotStatus(snapshotId, VoterFileIngestStatus.FAILED, err.message);
    throw err;
  }
}
