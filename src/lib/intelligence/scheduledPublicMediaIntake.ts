import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  canFetchMediaSource,
  getFeedApprovalBlockers,
  resolveFetchEligibleSources,
} from "@/lib/intelligence/mediaFeedApprovalGate";
import { loadArkansasMediaSourceRegistry } from "@/lib/intelligence/mediaSourceDiscovery";
import {
  dedupeMediaFindings,
  loadApprovedMediaSources,
  loadPublicMediaIntakeQueue,
  PUBLIC_MEDIA_INTAKE_QUEUE_REL,
} from "@/lib/intelligence/publicMediaIntake";
import { fetchApprovedRssFeed } from "@/lib/intelligence/publicFeedFetcher";
import type { PublicMediaIntakeFinding } from "@/lib/intelligence/publicMediaIntake";
import { appendFindingsToQueue } from "@/lib/intelligence/publicMediaReviewWorkflow";

export const PUBLIC_MEDIA_INTAKE_RUN_LOG_REL = "data/intelligence/public-media-intake-run-log.json";

export type IntakeRunMode = "DRY_RUN" | "LIVE_APPROVED_FEEDS";

export type PublicMediaIntakeRunEntry = {
  runId: string;
  startedAt: string;
  completedAt: string;
  mode: IntakeRunMode;
  sourceCount: number;
  fetchedSourceCount: number;
  skippedSourceCount: number;
  newFindingCount: number;
  duplicateFindingCount: number;
  errorCount: number;
  skippedSources: Array<{ sourceId: string; reason: string }>;
  errors: Array<{ sourceId: string; error: string }>;
  operator: string;
  notes: string;
};

export type PublicMediaIntakeRunLog = {
  version: number;
  generatedAt: string;
  purpose: string;
  runs: PublicMediaIntakeRunEntry[];
};

export type ScheduledIntakeRunResult = {
  run: PublicMediaIntakeRunEntry;
  wroteQueue: boolean;
};

function absPath(repoRoot: string, rel: string): string {
  return path.join(repoRoot, rel);
}

function readJson<T>(repoRoot: string, rel: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, rel), "utf8")) as T;
}

function writeJson(repoRoot: string, rel: string, data: unknown): void {
  const target = absPath(repoRoot, rel);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadPublicMediaIntakeRunLog(repoRoot: string = process.cwd()): PublicMediaIntakeRunLog {
  const abs = absPath(repoRoot, PUBLIC_MEDIA_INTAKE_RUN_LOG_REL);
  if (!existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      purpose: "Scheduled public media intake run log — NSI-10.",
      runs: [],
    };
  }
  return readJson<PublicMediaIntakeRunLog>(repoRoot, PUBLIC_MEDIA_INTAKE_RUN_LOG_REL);
}

export function appendIntakeRunLog(
  entry: PublicMediaIntakeRunEntry,
  repoRoot: string = process.cwd(),
): void {
  const log = loadPublicMediaIntakeRunLog(repoRoot);
  log.runs.push(entry);
  log.generatedAt = new Date().toISOString();
  writeJson(repoRoot, PUBLIC_MEDIA_INTAKE_RUN_LOG_REL, log);
}

export { resolveFetchEligibleSources };

export function summarizeScheduledIntakeRun(repoRoot?: string): {
  lastRun: PublicMediaIntakeRunEntry | null;
  totalRuns: number;
  lastNewFindingCount: number;
  lastMode: IntakeRunMode | null;
} {
  const log = loadPublicMediaIntakeRunLog(repoRoot);
  const lastRun = log.runs.length > 0 ? log.runs[log.runs.length - 1]! : null;
  return {
    lastRun,
    totalRuns: log.runs.length,
    lastNewFindingCount: lastRun?.newFindingCount ?? 0,
    lastMode: lastRun?.mode ?? null,
  };
}

async function executeIntakeRun(
  options: {
    mode: IntakeRunMode;
    repoRoot?: string;
    writeQueue?: boolean;
    operator?: string;
    notes?: string;
  },
): Promise<ScheduledIntakeRunResult> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const startedAt = new Date().toISOString();
  const runId = `intake-run-${Date.now()}`;
  const operator = options.operator ?? "system";
  const notes = options.notes ?? "";
  const writeQueue = options.writeQueue ?? options.mode === "LIVE_APPROVED_FEEDS";

  const registry = loadArkansasMediaSourceRegistry(repoRoot);
  const existing = loadPublicMediaIntakeQueue(repoRoot).findings;
  const skippedSources: Array<{ sourceId: string; reason: string }> = [];
  const errors: Array<{ sourceId: string; error: string }> = [];
  let fetchedSourceCount = 0;
  let allIncoming: PublicMediaIntakeFinding[] = [];

  const eligibleIds = new Set(resolveFetchEligibleSources(repoRoot).map((row) => row.sourceId));
  const approved = loadApprovedMediaSources(repoRoot);

  for (const source of registry.sources) {
    const blockers = getFeedApprovalBlockers(source);
    if (blockers.length > 0) {
      skippedSources.push({ sourceId: source.sourceId, reason: blockers.join("; ") });
      continue;
    }
    if (!eligibleIds.has(source.sourceId)) {
      skippedSources.push({ sourceId: source.sourceId, reason: "Not fetch-eligible per approval gate." });
    }
  }

  for (const source of approved) {
    if (!canFetchMediaSource(source)) {
      continue;
    }

    const dryRun = options.mode === "DRY_RUN";
    const result = await fetchApprovedRssFeed(source, { dryRun, repoRoot });

    if (result.skipped) {
      skippedSources.push({ sourceId: source.sourceId, reason: result.skipReason ?? "skipped" });
      continue;
    }
    if (result.error) {
      errors.push({ sourceId: source.sourceId, error: result.error });
      continue;
    }
    if (result.ok) {
      fetchedSourceCount += 1;
      allIncoming.push(...result.findings);
    }
  }

  const { unique, duplicates } = dedupeMediaFindings(allIncoming, existing);
  let wroteQueue = false;

  if (writeQueue && unique.length > 0) {
    appendFindingsToQueue(unique, repoRoot);
    wroteQueue = true;
  }

  const completedAt = new Date().toISOString();
  const run: PublicMediaIntakeRunEntry = {
    runId,
    startedAt,
    completedAt,
    mode: options.mode,
    sourceCount: registry.sources.length,
    fetchedSourceCount,
    skippedSourceCount: skippedSources.length,
    newFindingCount: unique.length,
    duplicateFindingCount: duplicates.length,
    errorCount: errors.length,
    skippedSources,
    errors,
    operator,
    notes,
  };

  appendIntakeRunLog(run, repoRoot);

  return { run, wroteQueue };
}

export async function runDryRunPublicMediaIntake(
  options: {
    repoRoot?: string;
    writeQueue?: boolean;
    operator?: string;
    notes?: string;
  } = {},
): Promise<ScheduledIntakeRunResult> {
  return executeIntakeRun({
    mode: "DRY_RUN",
    repoRoot: options.repoRoot,
    writeQueue: options.writeQueue ?? false,
    operator: options.operator,
    notes: options.notes ?? "Dry-run scheduled intake — queue write disabled by default.",
  });
}

export async function runScheduledPublicMediaIntake(
  options: {
    repoRoot?: string;
    writeQueue?: boolean;
    operator?: string;
    notes?: string;
  } = {},
): Promise<ScheduledIntakeRunResult> {
  return executeIntakeRun({
    mode: "LIVE_APPROVED_FEEDS",
    repoRoot: options.repoRoot,
    writeQueue: options.writeQueue ?? true,
    operator: options.operator,
    notes: options.notes ?? "Live approved feeds intake — only gate-approved sources.",
  });
}
