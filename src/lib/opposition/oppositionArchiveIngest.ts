import fs from "node:fs";
import path from "node:path";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import type {
  OppositionArchiveItem,
  OppositionClipRecord,
  OppositionQuoteRecord,
  OppositionRetrievalTask,
  OppositionSourceRecord,
  OppositionWritingRecord,
} from "./oppositionArchiveTypes";
import {
  appendOppositionArchiveAuditEvent,
  loadOppositionArchive,
  saveOppositionArchive,
  type OppositionArchiveBundle,
} from "./oppositionArchiveStore";
import { bindAllOppositionArchiveCitations } from "./oppositionCitationBinder";

const OPPONENT_ID = "kim-hammer";
const PROFILE_BASE = "data/opposition/kim-hammer-profile";

function readJson<T>(relPath: string, repoRoot: string): T {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), "utf8")) as T;
}

function nowIso(): string {
  return new Date().toISOString();
}

function hasItem(bundle: OppositionArchiveBundle, id: string): boolean {
  return bundle.items.items.some((i) => i.id === id);
}

function upsertItem(bundle: OppositionArchiveBundle, item: OppositionArchiveItem): void {
  const idx = bundle.items.items.findIndex((i) => i.id === item.id);
  if (idx >= 0) bundle.items.items[idx] = item;
  else bundle.items.items.push(item);
}

function appendSource(bundle: OppositionArchiveBundle, record: OppositionSourceRecord): void {
  if (!bundle.sources.records.some((r) => r.id === record.id)) {
    bundle.sources.records.push(record);
  }
}

function appendClip(bundle: OppositionArchiveBundle, record: OppositionClipRecord): void {
  if (!bundle.clips.records.some((r) => r.id === record.id)) {
    bundle.clips.records.push(record);
  }
}

function appendWriting(bundle: OppositionArchiveBundle, record: OppositionWritingRecord): void {
  if (!bundle.writings.records.some((r) => r.id === record.id)) {
    bundle.writings.records.push(record);
  }
}

function appendQuote(bundle: OppositionArchiveBundle, record: OppositionQuoteRecord): void {
  if (!bundle.quotes.records.some((r) => r.id === record.id)) {
    bundle.quotes.records.push(record);
  }
}

function mapEvidenceStatus(
  status: string,
): "VERIFIED_SOURCE" | "PARTIAL_SOURCE" | "NEEDS_RETRIEVAL" | "NEEDS_REVIEW" {
  if (status === "VERIFIED_FACT") return "VERIFIED_SOURCE";
  if (status === "REPORTED_CLAIM") return "PARTIAL_SOURCE";
  if (status === "RESEARCH_QUESTION") return "NEEDS_RETRIEVAL";
  return "NEEDS_REVIEW";
}

export function ingestKimHammerAuthoredWritings(
  bundle: OppositionArchiveBundle,
  repoRoot: string,
): number {
  const file = readJson<{
    items: Array<{
      id: string;
      title: string;
      type: string;
      date: string;
      publisher: string;
      url: string;
      summary: string;
      themes: string[];
      evidenceStatus: string;
      sourceConfidence: string;
    }>;
  }>(`${PROFILE_BASE}/kim-hammer-authored-writings.json`, repoRoot);

  let added = 0;
  for (const w of file.items) {
    const itemId = `archive-writing-${w.id}`;
    if (hasItem(bundle, itemId)) continue;

    const researchStatus = w.url ? mapEvidenceStatus(w.evidenceStatus) : "NEEDS_RETRIEVAL";
    const item: OppositionArchiveItem = {
      id: itemId,
      opponentId: OPPONENT_ID,
      itemType: "AUTHORED_WRITING",
      title: w.title,
      date: w.date,
      sourceTitle: w.publisher,
      sourceUrlOrPath: w.url || `${PROFILE_BASE}/kim-hammer-authored-writings.json`,
      sourceType: w.type,
      topicTags: w.themes,
      countyTags: [],
      officeTags: ["secretary-of-state"],
      summary: w.summary,
      directQuotes: [],
      clipReferences: [],
      writingReferences: [w.id],
      claimIds: [],
      citationSourceIds: [],
      citationAnchorIds: [],
      reliabilityRating: w.sourceConfidence === "HIGH" ? "HIGH" : "MEDIUM",
      sourceConfidence: w.sourceConfidence === "HIGH" ? 85 : 65,
      publicUseRisk: "MEDIUM",
      researchStatus,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    upsertItem(bundle, item);

    appendSource(bundle, {
      id: `source-writing-${w.id}`,
      opponentId: OPPONENT_ID,
      title: w.title,
      sourceType: w.type,
      urlOrPath: w.url || `${PROFILE_BASE}/kim-hammer-authored-writings.json`,
      reliabilityRating: w.sourceConfidence === "HIGH" ? "HIGH" : "MEDIUM",
      sourceConfidence: w.sourceConfidence === "HIGH" ? 85 : 65,
      archiveItemIds: [itemId],
      createdAt: nowIso(),
    });

    appendWriting(bundle, {
      id: w.id,
      opponentId: OPPONENT_ID,
      title: w.title,
      writingType: w.type,
      date: w.date,
      publisher: w.publisher,
      url: w.url || null,
      summary: w.summary,
      citationSourceId: null,
      retrievalNeeded: !w.url,
      createdAt: nowIso(),
    });

    added += 1;
  }
  return added;
}

export function ingestKimHammerDebateArchive(
  bundle: OppositionArchiveBundle,
  repoRoot: string,
): number {
  const file = readJson<{
    kimHammerDirectDebateAssets: Array<{
      id: string;
      title: string;
      url: string;
      assetType: string;
      evidenceStatus: string;
      sourceConfidence: string;
    }>;
    secretaryOfStateDebateArchive: Array<{
      id: string;
      title: string;
      url: string;
      assetType: string;
      evidenceStatus: string;
      sourceConfidence: string;
    }>;
  }>(`${PROFILE_BASE}/kim-hammer-debate-archive-index.json`, repoRoot);

  let added = 0;

  for (const clip of file.kimHammerDirectDebateAssets) {
    const itemId = `archive-clip-${clip.id}`;
    if (hasItem(bundle, itemId)) continue;

    const itemType = clip.assetType === "MEDIA_CLIP" ? "VIDEO_CLIP" : "DEBATE_CLIP";
    upsertItem(bundle, {
      id: itemId,
      opponentId: OPPONENT_ID,
      itemType,
      title: clip.title,
      date: null,
      sourceTitle: clip.title,
      sourceUrlOrPath: clip.url,
      sourceType: clip.assetType,
      topicTags: ["debate-prep", "media"],
      countyTags: [],
      officeTags: ["secretary-of-state"],
      summary: "Direct Kim Hammer media/debate asset — not formal debate archive",
      directQuotes: [],
      clipReferences: [clip.id],
      writingReferences: [],
      claimIds: [],
      citationSourceIds: [],
      citationAnchorIds: [],
      reliabilityRating: clip.sourceConfidence === "HIGH" ? "HIGH" : "MEDIUM",
      sourceConfidence: 70,
      publicUseRisk: "MEDIUM",
      researchStatus: mapEvidenceStatus(clip.evidenceStatus),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    appendClip(bundle, {
      id: clip.id,
      opponentId: OPPONENT_ID,
      title: clip.title,
      url: clip.url,
      clipType: "DIRECT_OPPONENT",
      timestamp: null,
      citationSourceId: null,
      retrievalNeeded: false,
      createdAt: nowIso(),
    });

    appendSource(bundle, {
      id: `source-clip-${clip.id}`,
      opponentId: OPPONENT_ID,
      title: clip.title,
      sourceType: clip.assetType,
      urlOrPath: clip.url,
      reliabilityRating: "MEDIUM",
      sourceConfidence: 70,
      archiveItemIds: [itemId],
      createdAt: nowIso(),
    });

    added += 1;
  }

  for (const ref of file.secretaryOfStateDebateArchive) {
    const itemId = `archive-ref-clip-${ref.id}`;
    if (hasItem(bundle, itemId)) continue;

    upsertItem(bundle, {
      id: itemId,
      opponentId: OPPONENT_ID,
      itemType: "DEBATE_CLIP",
      title: ref.title,
      date: null,
      sourceTitle: ref.title,
      sourceUrlOrPath: ref.url,
      sourceType: ref.assetType,
      topicTags: ["sos-debate-reference", "debate-prep"],
      countyTags: [],
      officeTags: ["secretary-of-state"],
      summary: "Reference SOS debate — not Kim Hammer footage",
      directQuotes: [],
      clipReferences: [ref.id],
      writingReferences: [],
      claimIds: [],
      citationSourceIds: [],
      citationAnchorIds: [],
      reliabilityRating: ref.sourceConfidence === "HIGH" ? "HIGH" : "MEDIUM",
      sourceConfidence: 80,
      publicUseRisk: "LOW",
      researchStatus: "VERIFIED_SOURCE",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    appendClip(bundle, {
      id: ref.id,
      opponentId: OPPONENT_ID,
      title: ref.title,
      url: ref.url,
      clipType: "REFERENCE_SOS",
      timestamp: null,
      citationSourceId: null,
      retrievalNeeded: false,
      createdAt: nowIso(),
    });

    added += 1;
  }

  return added;
}

export function ingestKimHammerBackgroundProfile(
  bundle: OppositionArchiveBundle,
  repoRoot: string,
): number {
  const itemId = "archive-background-deep-profile";
  if (hasItem(bundle, itemId)) return 0;

  const rel = `${PROFILE_BASE}/kim-hammer-background-deep-profile.json`;
  upsertItem(bundle, {
    id: itemId,
    opponentId: OPPONENT_ID,
    itemType: "BIOGRAPHICAL_RECORD",
    title: "Kim Hammer Background Deep Profile",
    date: null,
    sourceTitle: "Internal background profile",
    sourceUrlOrPath: rel,
    sourceType: "INTERNAL_ANALYSIS",
    topicTags: ["biography", "education", "civic"],
    countyTags: [],
    officeTags: ["secretary-of-state"],
    summary: "Structured biographical profile with evidence-status flags per field",
    directQuotes: [],
    clipReferences: [],
    writingReferences: [],
    claimIds: [],
    citationSourceIds: [],
    citationAnchorIds: [],
    reliabilityRating: "MEDIUM",
    sourceConfidence: 55,
    publicUseRisk: "HIGH",
    researchStatus: "NEEDS_REVIEW",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  appendSource(bundle, {
    id: "source-background-deep-profile",
    opponentId: OPPONENT_ID,
    title: "Kim Hammer Background Deep Profile",
    sourceType: "INTERNAL_ANALYSIS",
    urlOrPath: rel,
    reliabilityRating: "MEDIUM",
    sourceConfidence: 55,
    archiveItemIds: [itemId],
    createdAt: nowIso(),
  });

  return 1;
}

export function ingestKimHammerManagementAssessment(
  bundle: OppositionArchiveBundle,
  repoRoot: string,
): number {
  const itemId = "archive-management-capacity-assessment";
  if (hasItem(bundle, itemId)) return 0;

  const rel = `${PROFILE_BASE}/kim-hammer-management-capacity-assessment.json`;
  upsertItem(bundle, {
    id: itemId,
    opponentId: OPPONENT_ID,
    itemType: "MANAGEMENT_RECORD",
    title: "Kim Hammer SOS Management Capacity Assessment",
    date: null,
    sourceTitle: "Internal management capacity assessment",
    sourceUrlOrPath: rel,
    sourceType: "INTERNAL_ANALYSIS",
    topicTags: ["management", "sos-operations", "qualification"],
    countyTags: [],
    officeTags: ["secretary-of-state"],
    summary: "Qualification scrutiny signals — requires hard validation per retrieval task kh3b-management-readiness-evidence",
    directQuotes: [],
    clipReferences: [],
    writingReferences: [],
    claimIds: [],
    citationSourceIds: [],
    citationAnchorIds: [],
    reliabilityRating: "MEDIUM",
    sourceConfidence: 50,
    publicUseRisk: "HIGH",
    researchStatus: "NEEDS_REVIEW",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  appendSource(bundle, {
    id: "source-management-capacity",
    opponentId: OPPONENT_ID,
    title: "Management Capacity Assessment",
    sourceType: "INTERNAL_ANALYSIS",
    urlOrPath: rel,
    reliabilityRating: "MEDIUM",
    sourceConfidence: 50,
    archiveItemIds: [itemId],
    createdAt: nowIso(),
  });

  return 1;
}

export function ingestKimHammerElectionRecord(
  bundle: OppositionArchiveBundle,
  repoRoot: string,
): number {
  const rel = "data/opposition/kim-hammer-election-record-bill-index.json";
  const file = readJson<{
    rows: Array<{
      billNumber: string;
      actNumber: string | null;
      title: string;
      topicCategory: string[];
      sourceLinks: string[];
      confidenceLevel: string;
    }>;
  }>(rel, repoRoot);

  let added = 0;
  for (const row of file.rows) {
    const itemId = `archive-bill-${row.billNumber}`;
    if (hasItem(bundle, itemId)) continue;

    upsertItem(bundle, {
      id: itemId,
      opponentId: OPPONENT_ID,
      itemType: "BILL_RECORD",
      title: `${row.billNumber}${row.actNumber ? ` / Act ${row.actNumber}` : ""}: ${row.title.slice(0, 80)}`,
      date: null,
      sourceTitle: "Arkansas Legislature bill index",
      sourceUrlOrPath: row.sourceLinks[0] ?? rel,
      sourceType: "VOTING_RECORD",
      topicTags: row.topicCategory,
      countyTags: [],
      officeTags: ["legislature", "secretary-of-state"],
      summary: row.title,
      directQuotes: [],
      clipReferences: [],
      writingReferences: [],
      claimIds: [],
      citationSourceIds: [],
      citationAnchorIds: [],
      reliabilityRating: row.confidenceLevel === "HIGH" ? "HIGH" : "MEDIUM",
      sourceConfidence: row.confidenceLevel === "HIGH" ? 90 : 70,
      publicUseRisk: "MEDIUM",
      researchStatus: "VERIFIED_SOURCE",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    added += 1;
  }

  if (!hasItem(bundle, "archive-election-record-rollup")) {
    upsertItem(bundle, {
      id: "archive-election-record-rollup",
      opponentId: OPPONENT_ID,
      itemType: "VOTING_RECORD",
      title: `Kim Hammer Election Record Rollup (${file.rows.length} bills)`,
      date: null,
      sourceTitle: "Election record bill index",
      sourceUrlOrPath: rel,
      sourceType: "REGISTRY",
      topicTags: ["legislative-record"],
      countyTags: [],
      officeTags: ["legislature"],
      summary: `${file.rows.length} bills indexed with act numbers and topic categories`,
      directQuotes: [],
      clipReferences: [],
      writingReferences: [],
      claimIds: [],
      citationSourceIds: [],
      citationAnchorIds: [],
      reliabilityRating: "HIGH",
      sourceConfidence: 90,
      publicUseRisk: "MEDIUM",
      researchStatus: "VERIFIED_SOURCE",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    added += 1;
  }

  return added;
}

export function ingestKimHammerEvidenceIndex(
  bundle: OppositionArchiveBundle,
  repoRoot: string,
): number {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  let added = 0;

  for (const claim of evidence.exportReadyClaims.slice(0, 20)) {
    const itemId = `archive-claim-${claim.id}`;
    if (hasItem(bundle, itemId)) continue;

    upsertItem(bundle, {
      id: itemId,
      opponentId: OPPONENT_ID,
      itemType: "PUBLIC_STATEMENT",
      title: (claim.text || claim.claim || claim.id).slice(0, 120),
      date: null,
      sourceTitle: "Kim Hammer evidence index — export-ready claim",
      sourceUrlOrPath: "data/opposition/kim-hammer-profile/kim-hammer-kh4-claim-graph.json",
      sourceType: "CLAIM_GRAPH",
      topicTags: ["export-ready"],
      countyTags: [],
      officeTags: ["secretary-of-state"],
      summary: claim.text || claim.claim || "",
      directQuotes: [],
      clipReferences: [],
      writingReferences: [],
      claimIds: [claim.id],
      citationSourceIds: [],
      citationAnchorIds: [],
      reliabilityRating: "HIGH",
      sourceConfidence: 80,
      publicUseRisk: "MEDIUM",
      researchStatus: "VERIFIED_SOURCE",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    added += 1;
  }

  return added;
}

const RETRIEVAL_TASK_META: Record<
  string,
  {
    blocker: string;
    recommendedHumanAction: string;
    citationRequirement: string;
    nextRetrievalStep: string;
    canCloseFromLocalEvidence: boolean;
    localEvidence: string[];
  }
> = {
  "kh3b-pre-legislative-authored-writings": {
    blocker: "Archive has 3 indexed writings; pre-legislative sweep incomplete",
    recommendedHumanAction: "Complete newspaper archive sweep and legacy newsletter confirmations",
    citationRequirement: "URL + date + publisher for each writing before external use",
    nextRetrievalStep: "Retrieve oldest op-eds and church/community newsletter archives",
    canCloseFromLocalEvidence: false,
    localEvidence: ["3 writings in kim-hammer-authored-writings.json with URLs"],
  },
  "kh3b-long-tail-video-forum-record": {
    blocker: "Only 1 direct Kim Hammer media clip indexed — no formal debate archive",
    recommendedHumanAction: "Index county GOP and local TV forum clips with timestamps",
    citationRequirement: "Timestamp + quote context for each clip",
    nextRetrievalStep: "Sweep county GOP YouTube/Facebook and local TV clip archives",
    canCloseFromLocalEvidence: false,
    localEvidence: ["1 media clip: kh-runoff-media-clips-2026 (not formal debate)"],
  },
  "kh3b-management-readiness-evidence": {
    blocker: "Management assessment exists but hard validation incomplete",
    recommendedHumanAction: "Cross-check committee records against management-capacity assessment",
    citationRequirement: "Primary source for each operational-readiness claim",
    nextRetrievalStep: "Pull committee records and procurement/oversight references",
    canCloseFromLocalEvidence: false,
    localEvidence: ["kim-hammer-management-capacity-assessment.json (NEEDS_REVIEW)"],
  },
  "kh3b-biographical-validation-education-civic": {
    blocker: "High school and civic affiliations unverified",
    recommendedHumanAction: "Confirm high school and Rotary/Mason/civic honors from official records only",
    citationRequirement: "Official bio or confirmed civic organization record",
    nextRetrievalStep: "Retrieve official bio PDFs and civic organization newsletters",
    canCloseFromLocalEvidence: false,
    localEvidence: ["kim-hammer-background-deep-profile.json with NEEDS_REVIEW fields"],
  },
  "kh3b-business-employment-chronology": {
    blocker: "Business chronology partial — no normalized timeline",
    recommendedHumanAction: "Build source-backed employment timeline from filings and archived bios",
    citationRequirement: "Registry filing or archived bio for each chronology entry",
    nextRetrievalStep: "Search business registry and archived campaign about pages",
    canCloseFromLocalEvidence: false,
    localEvidence: ["Partial entries in background-deep-profile businessBackground"],
  },
  "kh3b-wayback-campaign-page-capture": {
    blocker: "Wayback sweep queued but incomplete",
    recommendedHumanAction: "Complete web.archive.org capture for pre-2025 campaign pages",
    citationRequirement: "Wayback snapshot URL + capture date",
    nextRetrievalStep: "Run Wayback sweep and link to claim-graph retrieval suggestion",
    canCloseFromLocalEvidence: false,
    localEvidence: ["IN_PROGRESS per intelligence-gaps completionNotes"],
  },
  "kh3b-local-radio-tv-quote-normalization": {
    blocker: "No normalized local radio/TV quote cards",
    recommendedHumanAction: "Standardize quote cards with source URL, date, timestamp, context",
    citationRequirement: "Full context sentence + station segment archive link",
    nextRetrievalStep: "Export closed-caption transcripts from station segment archives",
    canCloseFromLocalEvidence: false,
    localEvidence: [],
  },
};

export function ingestKimHammerRetrievalTasks(
  bundle: OppositionArchiveBundle,
  repoRoot: string,
): number {
  const gaps = readJson<{
    gaps: Array<{
      id: string;
      priority: string;
      rank: number;
      description: string;
      taskStatus: string;
      evidenceStatus: string;
      owner: string;
    }>;
  }>(`${PROFILE_BASE}/kim-hammer-intelligence-gaps.json`, repoRoot);

  let added = 0;
  for (const gap of gaps.gaps) {
    const meta = RETRIEVAL_TASK_META[gap.id];
    const existing = bundle.retrievalTasks.tasks.find((t) => t.id === gap.id);
    if (existing) continue;

    const partialEvidence = meta?.localEvidence.length ? true : false;
    const task: OppositionRetrievalTask = {
      id: gap.id,
      opponentId: OPPONENT_ID,
      rank: gap.rank,
      priority: gap.priority,
      description: gap.description,
      taskStatus: gap.taskStatus as OppositionRetrievalTask["taskStatus"],
      evidenceStatus: gap.evidenceStatus,
      owner: gap.owner,
      blocker: meta?.blocker ?? "Evidence not yet retrieved",
      currentAvailableEvidence: meta?.localEvidence ?? [],
      recommendedHumanAction: meta?.recommendedHumanAction ?? "Assign researcher and retrieve primary sources",
      citationRequirement: meta?.citationRequirement ?? "Primary source required before claim use",
      nextRetrievalStep: meta?.nextRetrievalStep ?? gap.description,
      canCloseFromLocalEvidence: meta?.canCloseFromLocalEvidence ?? false,
      closureStatus: partialEvidence ? "PARTIAL" : "OPEN",
      linkedArchiveItemIds: [],
      updatedAt: nowIso(),
    };
    bundle.retrievalTasks.tasks.push(task);
    added += 1;
  }

  return added;
}

export type IngestKimHammerArchiveResult = {
  writingsAdded: number;
  debateAdded: number;
  backgroundAdded: number;
  managementAdded: number;
  electionAdded: number;
  evidenceAdded: number;
  retrievalTasksAdded: number;
  citationBinding: ReturnType<typeof bindAllOppositionArchiveCitations>;
};

export function ingestAllKimHammerArchiveSources(repoRoot: string = process.cwd()): IngestKimHammerArchiveResult {
  const bundle = loadOppositionArchive(repoRoot);

  const writingsAdded = ingestKimHammerAuthoredWritings(bundle, repoRoot);
  const debateAdded = ingestKimHammerDebateArchive(bundle, repoRoot);
  const backgroundAdded = ingestKimHammerBackgroundProfile(bundle, repoRoot);
  const managementAdded = ingestKimHammerManagementAssessment(bundle, repoRoot);
  const electionAdded = ingestKimHammerElectionRecord(bundle, repoRoot);
  const evidenceAdded = ingestKimHammerEvidenceIndex(bundle, repoRoot);
  const retrievalTasksAdded = ingestKimHammerRetrievalTasks(bundle, repoRoot);

  saveOppositionArchive(bundle, repoRoot);

  const citationBinding = bindAllOppositionArchiveCitations(repoRoot);

  appendOppositionArchiveAuditEvent(
    {
      eventType: "INGEST_COMPLETE",
      actor: "oppositionArchiveIngest",
      notes: `writings=${writingsAdded} debate=${debateAdded} bills=${electionAdded} claims=${evidenceAdded} tasks=${retrievalTasksAdded}`,
    },
    repoRoot,
  );

  return {
    writingsAdded,
    debateAdded,
    backgroundAdded,
    managementAdded,
    electionAdded,
    evidenceAdded,
    retrievalTasksAdded,
    citationBinding,
  };
}
