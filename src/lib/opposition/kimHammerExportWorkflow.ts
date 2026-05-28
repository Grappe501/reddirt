import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  buildKimHammerDebateExportMarkdown,
  buildKimHammerDebateExportPayload,
} from "@/app/api/opposition/kim-hammer/debate-export/route";
import { canExportClaim, loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  buildKimHammerExportLineage,
  computeExportContentChecksum,
  KIM_HAMMER_EXPORT_HISTORY_REL,
  nextKimHammerPacketVersion,
  resolveCitationIdsForClaims,
  resolveNarrativeIdsForCitations,
} from "@/lib/opposition/kimHammerExportControl";
import type {
  KimHammerExportFormat,
  KimHammerExportHistoryEntry,
  KimHammerExportHistoryFile,
  KimHammerExportScope,
} from "@/lib/opposition/types/kimHammerExportControl";
import {
  KIM_HAMMER_EXPORT_FORMATS,
  KIM_HAMMER_EXPORT_SCOPES,
} from "@/lib/opposition/types/kimHammerExportControl";

export const KIM_HAMMER_EXPORT_AUDIT_LOG_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-export-audit-log.json";

export const KIM_HAMMER_EXPORT_BACKUP_DIR_REL =
  "data/opposition/kim-hammer-profile/backups";

export type KimHammerExportAuditEntry = {
  auditId: string;
  exportId: string;
  action: "RECORD_EXPORT";
  format: KimHammerExportFormat;
  scope: KimHammerExportScope;
  operator: string;
  notes: string;
  claimCount: number;
  citationCount: number;
  changedAt: string;
  changedByRoute: string;
  backupPath: string;
  sourceFile: string;
  packetVersion: string;
};

export type KimHammerExportAuditLog = {
  logVersion: string;
  updatedAt: string;
  entries: KimHammerExportAuditEntry[];
};

export type KimHammerRecordExportInput = {
  operator: string;
  changedByRoute: string;
  format: KimHammerExportFormat;
  scope: KimHammerExportScope;
  countyId?: string;
  exportNotes?: string;
};

export type KimHammerRecordExportResult =
  | {
      ok: true;
      auditId: string;
      exportId: string;
      packetVersion: string;
      backupPath: string;
      claimCount: number;
      citationCount: number;
      exportHistoryCount: number;
    }
  | { ok: false; error: string };

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

function toPosixRel(repoRoot: string, filePath: string): string {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function readJsonFile<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, relPath), "utf8")) as T;
}

function writeJsonFile(repoRoot: string, relPath: string, data: unknown): void {
  const target = absPath(repoRoot, relPath);
  const dir = path.dirname(target);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function backupExportJsonBeforeMutation(
  sourceRelPath: string,
  repoRoot: string = process.cwd(),
): string {
  const sourceAbs = absPath(repoRoot, sourceRelPath);
  if (!existsSync(sourceAbs)) {
    throw new Error(`Source file not found for backup: ${sourceRelPath}`);
  }

  const backupDirAbs = absPath(repoRoot, KIM_HAMMER_EXPORT_BACKUP_DIR_REL);
  if (!existsSync(backupDirAbs)) {
    mkdirSync(backupDirAbs, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = path.basename(sourceRelPath, ".json");
  const backupAbs = path.join(backupDirAbs, `${baseName}-${timestamp}.json`);
  copyFileSync(sourceAbs, backupAbs);
  return toPosixRel(repoRoot, backupAbs);
}

export function loadKimHammerExportAuditLog(
  repoRoot: string = process.cwd(),
): KimHammerExportAuditLog {
  if (!existsSync(absPath(repoRoot, KIM_HAMMER_EXPORT_AUDIT_LOG_REL))) {
    return { logVersion: "1.0", updatedAt: new Date().toISOString(), entries: [] };
  }
  return readJsonFile<KimHammerExportAuditLog>(repoRoot, KIM_HAMMER_EXPORT_AUDIT_LOG_REL);
}

function appendKimHammerExportAuditEntry(
  entry: KimHammerExportAuditEntry,
  repoRoot: string,
): void {
  const log = loadKimHammerExportAuditLog(repoRoot);
  log.updatedAt = entry.changedAt;
  log.entries = [...log.entries, entry].slice(-500);
  writeJsonFile(repoRoot, KIM_HAMMER_EXPORT_AUDIT_LOG_REL, log);
}

function buildAuditId(exportId: string, changedAt: string): string {
  const slug = exportId.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 80);
  const stamp = changedAt.replace(/[:.]/g, "-");
  return `export-audit-${slug}-${stamp}`;
}

function buildExportId(changedAt: string): string {
  return `export-${changedAt.replace(/[:.]/g, "-")}`;
}

function exportContentForFormat(format: KimHammerExportFormat): string {
  const payload = buildKimHammerDebateExportPayload();
  if (format === "MARKDOWN" || format === "CLIPBOARD") {
    return buildKimHammerDebateExportMarkdown(payload);
  }
  return JSON.stringify(payload, null, 2);
}

export function recordKimHammerExportEvent(
  input: KimHammerRecordExportInput,
  repoRoot: string = process.cwd(),
): KimHammerRecordExportResult {
  if (!input.operator?.trim()) return { ok: false, error: "operator is required." };
  if (!input.changedByRoute?.trim()) return { ok: false, error: "changedByRoute is required." };

  if (!KIM_HAMMER_EXPORT_FORMATS.includes(input.format)) {
    return { ok: false, error: `Invalid export format: ${input.format}` };
  }
  if (!KIM_HAMMER_EXPORT_SCOPES.includes(input.scope)) {
    return { ok: false, error: `Invalid export scope: ${input.scope}` };
  }
  if (input.scope === "COUNTY" && !input.countyId?.trim()) {
    return { ok: false, error: "countyId is required for COUNTY scope exports." };
  }

  const index = loadKimHammerEvidenceIndex(repoRoot);
  const exportReadyClaims = index.claims.filter(canExportClaim);
  if (exportReadyClaims.length === 0) {
    return { ok: false, error: "No export-ready claims available to record." };
  }

  const claimIds = exportReadyClaims.map((claim) => claim.id);
  const citationIds = resolveCitationIdsForClaims(claimIds, repoRoot);
  const narrativeIds = resolveNarrativeIdsForCitations(citationIds, repoRoot);
  const changedAt = new Date().toISOString();
  const exportId = buildExportId(changedAt);
  const packetVersion = nextKimHammerPacketVersion(repoRoot);
  const contentChecksum = computeExportContentChecksum(exportContentForFormat(input.format));

  const history = readJsonFile<KimHammerExportHistoryFile>(repoRoot, KIM_HAMMER_EXPORT_HISTORY_REL);

  const entry: KimHammerExportHistoryEntry = {
    exportId,
    packetVersion,
    format: input.format,
    scope: input.scope,
    countyId: input.countyId?.trim(),
    claimIds,
    citationIds,
    narrativeIds,
    operator: input.operator.trim(),
    exportNotes: input.exportNotes?.trim() ?? "",
    exportedAt: changedAt,
    claimCount: claimIds.length,
    citationCount: citationIds.length,
    contentChecksum,
  };

  try {
    const backupPath = backupExportJsonBeforeMutation(KIM_HAMMER_EXPORT_HISTORY_REL, repoRoot);
    history.entries.push(entry);
    history.generatedAt = changedAt;
    writeJsonFile(repoRoot, KIM_HAMMER_EXPORT_HISTORY_REL, history);

    const auditId = buildAuditId(exportId, changedAt);
    appendKimHammerExportAuditEntry(
      {
        auditId,
        exportId,
        action: "RECORD_EXPORT",
        format: input.format,
        scope: input.scope,
        operator: input.operator.trim(),
        notes: entry.exportNotes,
        claimCount: entry.claimCount,
        citationCount: entry.citationCount,
        changedAt,
        changedByRoute: input.changedByRoute,
        backupPath,
        sourceFile: KIM_HAMMER_EXPORT_HISTORY_REL,
        packetVersion,
      },
      repoRoot,
    );

    buildKimHammerExportLineage(claimIds, repoRoot, exportId, packetVersion);

    return {
      ok: true,
      auditId,
      exportId,
      packetVersion,
      backupPath,
      claimCount: entry.claimCount,
      citationCount: entry.citationCount,
      exportHistoryCount: history.entries.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export record failed.";
    return { ok: false, error: message };
  }
}

export { KIM_HAMMER_EXPORT_FORMATS, KIM_HAMMER_EXPORT_SCOPES };
