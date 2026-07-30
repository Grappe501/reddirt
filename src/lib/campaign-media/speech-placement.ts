/**
 * Propose curated homepage video ID placement (kelly-speaks / homepage).
 * Apply only with confirmCurate — never silent HOMEPAGE_*_VIDEO_ID mutate.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import {
  HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID,
  HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID,
} from "@/content/media/homepage-campaign-videos";
import { applySpeechEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { loadSpeechEvidenceStore, writeJsonAtomic } from "@/lib/campaign-media/evidence-store";
import { buildSpeechReadinessMatrix } from "@/lib/campaign-media/speech-readiness";

export const SPEECH_PLACEMENT_PROPOSALS_REL = "data/campaign-media/speech-placement-proposals.json";
export const SPEECH_PLACEMENT_STUB_REL = "data/campaign-media/speech-placement-stub.md";
export const HOMEPAGE_VIDEO_CURATION_FILE_REL = "src/content/media/homepage-campaign-videos.ts";

export type SpeechPlacementSlot = "primaryMessage" | "acrossArkansas";

export type SpeechPlacementDiff = {
  slot: SpeechPlacementSlot;
  currentId: string;
  proposedId: string;
  rationale: string;
  changed: boolean;
};

export type SpeechPlacementProposal = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "applied" | "dismissed";
  diffs: SpeechPlacementDiff[];
  warnings: string[];
  nextActions: string[];
  appliedAt?: string;
  undoSnapshotId?: string;
};

export type SpeechPlacementUndoSnapshot = {
  id: string;
  createdAt: string;
  proposalId: string;
  primaryId: string;
  acrossId: string;
  fileBackupRel: string;
};

type SpeechPlacementStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  proposals: SpeechPlacementProposal[];
  undoSnapshots: SpeechPlacementUndoSnapshot[];
};

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function emptyStore(): SpeechPlacementStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Homepage video placement proposals — apply only with confirmCurate; never silent HOMEPAGE_*_VIDEO_ID mutate.",
    proposals: [],
    undoSnapshots: [],
  };
}

export function loadSpeechPlacementStore(): SpeechPlacementStore {
  const p = abs(SPEECH_PLACEMENT_PROPOSALS_REL);
  if (!existsSync(p)) return emptyStore();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<SpeechPlacementStore>;
    return {
      ...emptyStore(),
      ...raw,
      version: 1,
      proposals: Array.isArray(raw.proposals) ? raw.proposals : [],
      undoSnapshots: Array.isArray(raw.undoSnapshots) ? raw.undoSnapshots : [],
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: SpeechPlacementStore): void {
  writeJsonAtomic(SPEECH_PLACEMENT_PROPOSALS_REL, {
    ...store,
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}

export function getCurrentSpeechPlacementSnapshot(): {
  primaryId: string;
  acrossId: string;
} {
  return {
    primaryId: HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID,
    acrossId: HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID,
  };
}

function pickCandidate(
  slot: SpeechPlacementSlot,
  currentId: string,
): { id: string; rationale: string; warning?: string } {
  const store = loadSpeechEvidenceStore();
  const matrix = buildSpeechReadinessMatrix();
  const byId = new Map(matrix.rows.map((r) => [r.id, r]));

  const scored = CAMPAIGN_MEDIA_REGISTRY.map((base) => {
    const overlay = store.speeches[base.id];
    const merged = applySpeechEvidenceOverlay(base, overlay);
    const row = byId.get(base.id);
    let score = row?.readinessScore ?? 0;
    if (merged.publicationStatus === "PUBLISHED" && merged.approvedForPublic !== false) score += 25;
    if (merged.homepageEligible) score += 20;
    if (overlay?.homepageCandidate) score += 15;
    if (base.format === "SHORT") score -= 30;
    if (slot === "acrossArkansas" && (base.counties?.length || overlay?.counties?.length)) score += 8;
    if (slot === "primaryMessage" && base.id.includes("office")) score += 12;
    if (base.id === currentId) score += 5;
    return { id: base.id, score, merged };
  })
    .filter((r) => r.merged.publicationStatus === "PUBLISHED" && r.merged.approvedForPublic !== false)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const best = scored[0];
  if (!best) {
    return {
      id: currentId,
      rationale: "No PUBLISHED + not-held speech qualified — keep current curated id.",
      warning: `No publish-ready candidate for ${slot}.`,
    };
  }
  return {
    id: best.id,
    rationale:
      best.id === currentId
        ? `Keep current ${slot} id (best readiness among PUBLISHED speeches).`
        : `Propose ${best.id} for ${slot} (readiness + homepageCandidate + PUBLISHED).`,
  };
}

export function proposeSpeechPlacement(input?: { persist?: boolean }): SpeechPlacementProposal {
  const current = getCurrentSpeechPlacementSnapshot();
  const warnings: string[] = [];
  const primary = pickCandidate("primaryMessage", current.primaryId);
  const across = pickCandidate("acrossArkansas", current.acrossId);
  if (primary.warning) warnings.push(primary.warning);
  if (across.warning) warnings.push(across.warning);
  if (primary.id === across.id) {
    warnings.push("Primary and Across propose the same id — Across kept current to avoid duplicate.");
  }
  const acrossId =
    primary.id === across.id && across.id !== current.acrossId ? current.acrossId : across.id;

  const diffs: SpeechPlacementDiff[] = [
    {
      slot: "primaryMessage",
      currentId: current.primaryId,
      proposedId: primary.id,
      rationale: primary.rationale,
      changed: primary.id !== current.primaryId,
    },
    {
      slot: "acrossArkansas",
      currentId: current.acrossId,
      proposedId: acrossId,
      rationale:
        acrossId === across.id
          ? across.rationale
          : "Kept current Across id to avoid duplicating Primary propose.",
      changed: acrossId !== current.acrossId,
    },
  ];

  const now = new Date().toISOString();
  const proposal: SpeechPlacementProposal = {
    id: `splace-${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    status: "pending",
    diffs,
    warnings,
    nextActions: [
      "Review primary/across diffs on Videos → Placement strip.",
      "Apply with confirmCurate:true rewrites homepage-campaign-videos.ts (+ undo).",
      "Or copy speech-placement-stub.md manually — never silent mutate.",
    ],
  };

  if (input?.persist !== false) {
    const store = loadSpeechPlacementStore();
    store.proposals = [proposal, ...store.proposals.filter((p) => p.id !== proposal.id)].slice(0, 40);
    saveStore(store);
  }
  return proposal;
}

export function getSpeechPlacementProposal(id: string): SpeechPlacementProposal | null {
  const tid = String(id ?? "").trim();
  if (!tid) return null;
  return loadSpeechPlacementStore().proposals.find((p) => p.id === tid) ?? null;
}

export function writeSpeechPlacementStub(proposal: SpeechPlacementProposal): {
  ok: boolean;
  message: string;
  relativePath: string;
} {
  const lines = [
    "# Speech / homepage video placement stub",
    "",
    "**Do not auto-apply.** Review, then Apply with confirmCurate.",
    "",
    `Proposal: ${proposal.id}`,
    `Generated: ${proposal.updatedAt}`,
    "",
  ];
  for (const d of proposal.diffs) {
    lines.push(`## ${d.slot}`);
    lines.push("");
    lines.push(d.rationale);
    lines.push("");
    lines.push(`- Current: \`${d.currentId}\``);
    lines.push(`- Proposed: \`${d.proposedId}\``);
    lines.push(`- Changed: ${d.changed ? "yes" : "no"}`);
    lines.push("");
  }
  if (proposal.warnings.length) {
    lines.push("## Warnings");
    lines.push("");
    for (const w of proposal.warnings) lines.push(`- ${w}`);
    lines.push("");
  }
  const target = abs(SPEECH_PLACEMENT_STUB_REL);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `${lines.join("\n")}\n`, "utf8");
  return {
    ok: true,
    message: `Wrote speech placement stub → ${SPEECH_PLACEMENT_STUB_REL}`,
    relativePath: SPEECH_PLACEMENT_STUB_REL,
  };
}

function renderHomepageVideoCurationFile(input: {
  primaryId: string;
  acrossId: string;
  priorSource: string;
}): string {
  let next = input.priorSource;
  next = next.replace(
    /export const HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID = "[^"]+" as const;/,
    `export const HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID = "${input.primaryId}" as const;`,
  );
  next = next.replace(
    /export const HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID = "[^"]+" as const;/,
    `export const HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID = "${input.acrossId}" as const;`,
  );
  if (
    !next.includes(`HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID = "${input.primaryId}"`) ||
    !next.includes(`HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID = "${input.acrossId}"`)
  ) {
    throw new Error("Failed to rewrite homepage video ID constants — refuse partial mutate.");
  }
  return next;
}

export function applySpeechPlacementProposal(input: {
  proposalId: string;
  confirmCurate: boolean;
}): {
  ok: boolean;
  message: string;
  undoSnapshotId?: string;
  warnings?: string[];
} {
  if (!input.confirmCurate) {
    return { ok: false, message: "confirmCurate:true required — refuse silent HOMEPAGE_*_VIDEO_ID mutate." };
  }
  const proposal = getSpeechPlacementProposal(input.proposalId);
  if (!proposal) return { ok: false, message: `Proposal not found: ${input.proposalId}` };
  if (proposal.status === "applied") {
    return { ok: false, message: "Proposal already applied — propose a new diff or undo." };
  }

  const primaryId =
    proposal.diffs.find((d) => d.slot === "primaryMessage")?.proposedId ??
    HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID;
  const acrossId =
    proposal.diffs.find((d) => d.slot === "acrossArkansas")?.proposedId ??
    HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID;

  const fileAbs = abs(HOMEPAGE_VIDEO_CURATION_FILE_REL);
  if (!existsSync(fileAbs)) {
    return { ok: false, message: `${HOMEPAGE_VIDEO_CURATION_FILE_REL} missing.` };
  }
  const priorSource = readFileSync(fileAbs, "utf8");
  const current = getCurrentSpeechPlacementSnapshot();
  const snapId = `svundo-${Date.now().toString(36)}`;
  const backupRel = `data/campaign-media/homepage-video-curation-backups/${snapId}.ts.bak`;
  mkdirSync(path.dirname(abs(backupRel)), { recursive: true });
  writeFileSync(abs(backupRel), priorSource, "utf8");

  const store = loadSpeechPlacementStore();
  store.undoSnapshots = [
    {
      id: snapId,
      createdAt: new Date().toISOString(),
      proposalId: proposal.id,
      primaryId: current.primaryId,
      acrossId: current.acrossId,
      fileBackupRel: backupRel,
    },
    ...store.undoSnapshots,
  ].slice(0, 20);

  try {
    const next = renderHomepageVideoCurationFile({ primaryId, acrossId, priorSource });
    writeFileSync(fileAbs, next.endsWith("\n") ? next : `${next}\n`, "utf8");
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Rewrite failed." };
  }

  proposal.status = "applied";
  proposal.appliedAt = new Date().toISOString();
  proposal.undoSnapshotId = snapId;
  proposal.updatedAt = new Date().toISOString();
  store.proposals = [proposal, ...store.proposals.filter((p) => p.id !== proposal.id)].slice(0, 40);
  saveStore(store);
  writeSpeechPlacementStub(proposal);

  return {
    ok: true,
    message: `Applied speech placement ${proposal.id} → ${HOMEPAGE_VIDEO_CURATION_FILE_REL} (undo ${snapId}).`,
    undoSnapshotId: snapId,
    warnings: proposal.warnings,
  };
}

export function undoSpeechPlacement(input: {
  undoSnapshotId: string;
  confirmCurate: boolean;
}): { ok: boolean; message: string } {
  if (!input.confirmCurate) {
    return { ok: false, message: "confirmCurate:true required — refuse silent undo." };
  }
  const snap = loadSpeechPlacementStore().undoSnapshots.find(
    (s) => s.id === String(input.undoSnapshotId ?? "").trim(),
  );
  if (!snap) return { ok: false, message: `Undo snapshot not found: ${input.undoSnapshotId}` };
  const backupAbs = abs(snap.fileBackupRel);
  if (!existsSync(backupAbs)) {
    return { ok: false, message: `Backup missing: ${snap.fileBackupRel}` };
  }
  writeFileSync(abs(HOMEPAGE_VIDEO_CURATION_FILE_REL), readFileSync(backupAbs, "utf8"), "utf8");
  return {
    ok: true,
    message: `Restored ${HOMEPAGE_VIDEO_CURATION_FILE_REL} from ${snap.fileBackupRel}.`,
  };
}
