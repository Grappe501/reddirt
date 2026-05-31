import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type VideoProcessingStatus =
  | "DISCOVERED"
  | "QUEUED_FOR_METADATA"
  | "METADATA_READY"
  | "QUEUED_FOR_AUDIO"
  | "AUDIO_READY"
  | "QUEUED_FOR_TRANSCRIPTION"
  | "TRANSCRIBED"
  | "SPEAKER_NEEDS_REVIEW"
  | "SPEAKER_CONFIRMED"
  | "CHUNKED"
  | "CLAIMS_INGESTED"
  | "FAILED"
  | "BLOCKED"
  | "TRANSCRIPTION_DEFERRED";

export type LegislativeVideoCandidate = {
  id: string;
  billNumber: string;
  session: string;
  committeeName: string;
  meetingDate: string;
  videoUrl: string;
  sourcePageUrl: string;
  sourceType: string;
  duration: string | null;
  agendaPosition: number | null;
  sponsorExpected: boolean;
  expectedSpeaker: string;
  discoveryConfidence: number;
  processingStatus: VideoProcessingStatus;
  retrievalWarnings: string[];
  createdAt: string;
  updatedAt: string;
};

export type VideoCandidatesFile = {
  version: number;
  generatedAt: string;
  candidates: LegislativeVideoCandidate[];
};

export type VideoProcessingQueueFile = {
  version: number;
  generatedAt: string;
  queue: Array<{ candidateId: string; step: string; status: string; enqueuedAt: string }>;
};

export const VIDEO_CANDIDATES_REL = "data/legislature/video-archives/video-candidates.json";
export const VIDEO_QUEUE_REL = "data/legislature/video-archives/video-processing-queue.json";
export const VIDEO_AUDIT_REL = "data/legislature/video-archives/video-processing-audit-log.json";

function readJson<T>(repoRoot: string, rel: string, fallback: T): T {
  const abs = path.join(repoRoot, rel);
  if (!existsSync(abs)) return fallback;
  return JSON.parse(readFileSync(abs, "utf8")) as T;
}

function writeJson(repoRoot: string, rel: string, data: unknown): void {
  const abs = path.join(repoRoot, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadVideoCandidates(repoRoot: string = process.cwd()): VideoCandidatesFile {
  return readJson(repoRoot, VIDEO_CANDIDATES_REL, {
    version: 1,
    generatedAt: new Date().toISOString(),
    candidates: [],
  });
}

export function saveVideoCandidates(file: VideoCandidatesFile, repoRoot: string = process.cwd()): void {
  file.generatedAt = new Date().toISOString();
  writeJson(repoRoot, VIDEO_CANDIDATES_REL, file);
}

export function upsertVideoCandidate(candidate: LegislativeVideoCandidate, repoRoot: string = process.cwd()): void {
  const file = loadVideoCandidates(repoRoot);
  const idx = file.candidates.findIndex((c) => c.id === candidate.id);
  if (idx >= 0) file.candidates[idx] = candidate;
  else file.candidates.push(candidate);
  saveVideoCandidates(file, repoRoot);
}

export function loadVideoProcessingQueue(repoRoot: string = process.cwd()): VideoProcessingQueueFile {
  return readJson(repoRoot, VIDEO_QUEUE_REL, {
    version: 1,
    generatedAt: new Date().toISOString(),
    queue: [],
  });
}

export function enqueueVideoProcessingStep(
  candidateId: string,
  step: string,
  repoRoot: string = process.cwd(),
): void {
  const file = loadVideoProcessingQueue(repoRoot);
  if (!file.queue.some((q) => q.candidateId === candidateId && q.step === step && q.status === "PENDING")) {
    file.queue.push({
      candidateId,
      step,
      status: "PENDING",
      enqueuedAt: new Date().toISOString(),
    });
  }
  file.generatedAt = new Date().toISOString();
  writeJson(repoRoot, VIDEO_QUEUE_REL, file);
}

export function appendVideoProcessingAudit(
  event: { eventType: string; candidateId: string; notes: string },
  repoRoot: string = process.cwd(),
): void {
  const log = readJson<{ version: number; generatedAt: string; events: unknown[] }>(repoRoot, VIDEO_AUDIT_REL, {
    version: 1,
    generatedAt: new Date().toISOString(),
    events: [],
  });
  log.events.push({ ...event, timestamp: new Date().toISOString() });
  log.generatedAt = new Date().toISOString();
  writeJson(repoRoot, VIDEO_AUDIT_REL, log);
}

export function summarizeVideoArchiveStore(repoRoot: string = process.cwd()) {
  const candidates = loadVideoCandidates(repoRoot);
  const byStatus: Record<string, number> = {};
  for (const c of candidates.candidates) {
    byStatus[c.processingStatus] = (byStatus[c.processingStatus] ?? 0) + 1;
  }
  return {
    totalCandidates: candidates.candidates.length,
    byStatus,
    withVideoUrl: candidates.candidates.filter((c) => c.videoUrl).length,
    transcribed: candidates.candidates.filter((c) =>
      ["TRANSCRIBED", "SPEAKER_NEEDS_REVIEW", "SPEAKER_CONFIRMED", "CHUNKED", "CLAIMS_INGESTED"].includes(
        c.processingStatus,
      ),
    ).length,
  };
}
