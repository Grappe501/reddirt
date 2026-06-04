import fs from "node:fs";
import path from "node:path";
import { parseClaimsReview } from "@/lib/opposition/kimHammerWorkbench";
import { loadDebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4";
import {
  appendCitationAnchor,
  appendCitationSource,
  appendClaimLedgerAuditEvent,
  loadClaimLedger,
  upsertClaimLedgerEntriesBatch,
} from "./claimLedgerStore";
import {
  detectDuplicateClaim,
  generateClaimFingerprint,
  mergeClaimEvidence,
  normalizeClaimText,
} from "./claimNormalization";
import { scoreClaimEvidence } from "./evidenceDepthScoring";
import { CLAIM_LEDGER_DEFAULTS, type CitationAnchor, type CitationSource, type ClaimLedgerEntry } from "./claimLedgerTypes";

export const DEBATE_WEEK_BRIEF_ID = "debate-week-v4-kim-hammer";
const TAG_DEBATE_WEEK = "debate-week";

type BillIndexRow = { billNumber: string; sessionYear: string; sourceLinks?: string[] };

function loadBillIndex(repoRoot: string): BillIndexRow[] {
  const raw = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "data/opposition/kim-hammer-election-record-bill-index.json"), "utf8"),
  ) as { rows: BillIndexRow[] };
  return raw.rows;
}

function arklegUrlForBill(billNumber: string, rows: BillIndexRow[]): string | null {
  const row = rows.find((r) => r.billNumber.toUpperCase() === billNumber.toUpperCase());
  const fromLinks = row?.sourceLinks?.find((u) => u.includes("arkleg.state.ar.us"));
  if (fromLinks) return fromLinks;
  if (!row?.sessionYear) return null;
  return `https://www.arkleg.state.ar.us/Bills/Detail?id=${billNumber}&ddBienniumSession=${encodeURIComponent(row.sessionYear)}`;
}

type SeedRow = {
  claimText: string;
  assessment: "supported" | "partially supported" | "needs more research" | "unsupported" | "do-not-say";
  sourceHint?: string;
  saferWording?: string;
  billAnchor?: string;
};

function extractArklegUrl(text: string): string | null {
  const match = text.match(/https:\/\/www\.arkleg\.state\.ar\.us[^\s)|]*/i);
  return match?.[0] ?? null;
}

function classificationFor(assessment: SeedRow["assessment"]): ClaimLedgerEntry["classification"] {
  if (assessment === "supported") return "VERIFIED";
  if (assessment === "partially supported") return "NEEDS_REVIEW";
  if (assessment === "needs more research") return "NEEDS_REVIEW";
  if (assessment === "do-not-say") return "UNSUPPORTED";
  return "UNSUPPORTED";
}

function statusFor(assessment: SeedRow["assessment"]): ClaimLedgerEntry["verificationStatus"] {
  if (assessment === "supported") return "HUMAN_APPROVED_INTERNAL";
  if (assessment === "do-not-say") return "REJECTED";
  if (assessment === "unsupported") return "NEEDS_REVIEW";
  return "NEEDS_REVIEW";
}

function publishabilityFor(assessment: SeedRow["assessment"]): ClaimLedgerEntry["publishabilityStatus"] {
  if (assessment === "supported") return "APPROVED_FOR_INTERNAL_USE";
  return "NOT_PUBLISHABLE";
}

function riskFor(assessment: SeedRow["assessment"]): ClaimLedgerEntry["publicUseRisk"] {
  if (assessment === "do-not-say") return "CRITICAL";
  if (assessment === "unsupported") return "HIGH";
  if (assessment === "needs more research") return "HIGH";
  if (assessment === "partially supported") return "MEDIUM";
  return "LOW";
}

function buildEntry(
  row: SeedRow,
  ledger: ClaimLedgerEntry[],
  billIndex: BillIndexRow[],
  repoRoot: string,
  now: string,
): ClaimLedgerEntry | null {
  const claimText = row.saferWording?.trim() || row.claimText.trim();
  if (!claimText) return null;

  const normalizedClaimText = normalizeClaimText(claimText);
  const fingerprint = generateClaimFingerprint({
    normalizedClaimText,
    countySlug: null,
    opponentId: "kim-hammer",
    domain: "debate",
  });

  const existing = detectDuplicateClaim(fingerprint, ledger);
  const id = existing?.id ?? `claim-debate-${fingerprint}`;

  const sourceUrl =
    (row.sourceHint ? extractArklegUrl(row.sourceHint) : null) ??
    (row.billAnchor ? arklegUrlForBill(row.billAnchor, billIndex) : null);
  const sourceIds: string[] = [];
  const anchorIds: string[] = [];

  if (sourceUrl) {
    const sourceId = `src-debate-${fingerprint}`;
    const anchorId = `anchor-debate-${fingerprint}`;
    const source: CitationSource = {
      id: sourceId,
      title: row.billAnchor ? `Arkleg — ${row.billAnchor}` : "Arkansas Legislature bill record",
      sourceType: "url",
      urlOrPath: sourceUrl,
      publicationDate: null,
      retrievedAt: now,
      author: null,
      publisher: "Arkansas Legislature",
      jurisdiction: "Arkansas",
      countySlug: null,
      opponentId: "kim-hammer",
      reliabilityRating: "HIGH",
      sourceConfidence: 85,
      quoteOrExcerpt: null,
      summary: row.sourceHint ?? sourceUrl,
      limitations: ["Title-level review — confirm enrolled act text before public adaptation"],
      createdAt: now,
    };
    appendCitationSource(source, repoRoot);
    sourceIds.push(sourceId);

    const anchor: CitationAnchor = {
      id: anchorId,
      sourceId,
      anchorType: "url",
      lineRange: null,
      pageNumber: null,
      section: null,
      claimSupportType: "DIRECT_SUPPORT",
      excerpt: null,
      notes: sourceUrl,
    };
    appendCitationAnchor(anchor, repoRoot);
    anchorIds.push(anchorId);
  }

  const classification = classificationFor(row.assessment);
  const verificationStatus = statusFor(row.assessment);
  const base: ClaimLedgerEntry = {
    id,
    claimText,
    normalizedClaimText,
    claimFingerprint: fingerprint,
    claimType: row.assessment === "do-not-say" ? "PROHIBITED" : "FACTUAL",
    domain: "debate",
    countySlug: null,
    opponentId: "kim-hammer",
    topicTags: [TAG_DEBATE_WEEK, "kim-hammer", "debate-prep", ...(row.billAnchor ? [row.billAnchor] : [])],
    sourceBriefIds: [DEBATE_WEEK_BRIEF_ID],
    sourceEvidencePacketIds: [],
    sourceReviewItemIds: [],
    citationAnchorIds: anchorIds,
    supportingSourceIds: sourceIds,
    contradictingSourceIds: [],
    classification,
    verificationStatus,
    publishabilityStatus: publishabilityFor(row.assessment),
    evidenceDepthScore: 0,
    evidenceStrength: "MODERATE",
    confidenceScore: 0,
    publicUseRisk: riskFor(row.assessment),
    internalUseStatus:
      row.assessment === "do-not-say"
        ? "DO_NOT_USE"
        : row.assessment === "supported"
          ? "SAFE_FOR_INTERNAL_STRATEGY"
          : "RESEARCH_ONLY",
    recommendedHumanAction:
      row.assessment === "supported"
        ? "Approved for internal debate rehearsal — verify act text before TV or paid media"
        : row.assessment === "do-not-say"
          ? "Do not use on stage, in ads, or social"
          : "Complete sourcing before debate or public use",
    humanReview: {
      reviewedBy: row.assessment === "supported" ? "debateClaimsSeed.v1" : null,
      reviewedAt: row.assessment === "supported" ? now : null,
      decision: row.assessment === "supported" ? "APPROVED_INTERNAL" : row.assessment === "do-not-say" ? "REJECTED" : null,
      notes: row.claimText !== claimText ? `Synopsis: ${row.claimText}` : "",
      requiredEdits: [],
      approvalScope: row.assessment === "supported" ? "INTERNAL" : "NONE",
    },
    history: existing?.history ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    createdBy: "debateClaimsSeed.v1",
    lastReviewedAt: row.assessment === "supported" ? now : existing?.lastReviewedAt ?? null,
  };

  const scored = scoreClaimEvidence({
    claim: base,
    anchors: anchorIds.map((aid) => ({
      id: aid,
      sourceId: sourceIds[0] ?? "",
      anchorType: "url" as const,
      lineRange: null,
      pageNumber: null,
      section: null,
      claimSupportType: "DIRECT_SUPPORT" as const,
      excerpt: null,
      notes: sourceUrl ?? "",
    })),
    sources: [],
    shellCounty: false,
  });
  base.evidenceDepthScore = scored.evidenceDepthScore;
  base.confidenceScore = scored.confidenceScore;
  base.evidenceStrength = scored.evidenceStrength;

  if (existing) {
    return mergeClaimEvidence(existing, base);
  }

  base.history.push({
    timestamp: now,
    eventType: "INGESTED",
    actor: "debateClaimsSeed.v1",
    previousStatus: null,
    nextStatus: CLAIM_LEDGER_DEFAULTS.verificationStatus,
    notes: `Debate week seed — ${row.assessment}`,
  });
  if (verificationStatus === "HUMAN_APPROVED_INTERNAL") {
    base.history.push({
      timestamp: now,
      eventType: "APPROVED_INTERNAL",
      actor: "debateClaimsSeed.v1",
      previousStatus: "DRAFT",
      nextStatus: "HUMAN_APPROVED_INTERNAL",
      notes: "Auto-approved for internal debate rehearsal only",
    });
  }
  if (verificationStatus === "REJECTED") {
    base.history.push({
      timestamp: now,
      eventType: "REJECTED",
      actor: "debateClaimsSeed.v1",
      previousStatus: "DRAFT",
      nextStatus: "REJECTED",
      notes: "Do-not-say gate",
    });
  }

  return base;
}

function loadClaimsReviewMarkdown(repoRoot: string): SeedRow[] {
  const mdPath = path.join(repoRoot, "docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md");
  const markdown = fs.readFileSync(mdPath, "utf8");
  const parsed = parseClaimsReview(markdown);
  const billFromText = (text: string): string | undefined => {
    const hits = text.match(/\b(SB|HB)\d+\b/gi);
    return hits?.[0]?.toUpperCase();
  };

  const synopsisBillHints: Record<string, string> = {
    "Arkansas Poll Watchers": "HB1457",
    "election law complaint": "SB291",
    "2025 citizen initiative": "SB207",
    "Voter Registration and Secure": "HB1707",
  };

  const rows: SeedRow[] = parsed.map((p) => {
    const combined = `${p.claim} ${p.saferWording} ${p.sourceNeeded}`;
    let billAnchor = billFromText(combined);
    if (!billAnchor) {
      for (const [needle, bill] of Object.entries(synopsisBillHints)) {
        if (p.claim.includes(needle)) {
          billAnchor = bill;
          break;
        }
      }
    }
    return {
      claimText: p.claim,
      assessment: p.assessment,
      sourceHint: p.sourceNeeded,
      saferWording: p.saferWording,
      billAnchor,
    };
  });

  const unsupportedSection = markdown.split("## Unsupported")[1]?.split("##")[0] ?? "";
  for (const line of unsupportedSection.split(/\r?\n/)) {
    if (!line.trim().startsWith("-")) continue;
    rows.push({
      claimText: line.replace(/^-\s*/, "").trim(),
      assessment: "do-not-say",
      sourceHint: "docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md",
    });
  }

  return rows;
}

export function buildDebateWeekClaimSeedRows(repoRoot: string = process.cwd()): SeedRow[] {
  const v4 = loadDebateIntelligenceV4Packet();
  const rows = loadClaimsReviewMarkdown(repoRoot);

  for (const risk of v4.hub.riskClaims) {
    rows.push({ claimText: risk, assessment: "do-not-say", sourceHint: "v4 hub riskClaims" });
  }

  for (const card of v4.rebuttalPlaybook.slice(0, 6)) {
    rows.push({
      claimText: `Rebuttal bridge (${card.prompt}): ${card.kellyBridge}`,
      assessment: "partially supported",
      sourceHint: "kim-hammer-rebuttal-prep.json",
      saferWording: card.kellyBridge,
    });
  }

  return rows;
}

export function seedDebateWeekClaims(repoRoot: string = process.cwd()): {
  added: number;
  updated: number;
  totalDebate: number;
} {
  const now = new Date().toISOString();
  const ledger = loadClaimLedger(repoRoot);
  const billIndex = loadBillIndex(repoRoot);
  const rows = buildDebateWeekClaimSeedRows(repoRoot);
  const toUpsert: ClaimLedgerEntry[] = [];
  let added = 0;
  let updated = 0;

  for (const row of rows) {
    const before = detectDuplicateClaim(
      generateClaimFingerprint({
        normalizedClaimText: normalizeClaimText(row.saferWording?.trim() || row.claimText.trim()),
        countySlug: null,
        opponentId: "kim-hammer",
        domain: "debate",
      }),
      ledger.entries,
    );
    const entry = buildEntry(row, ledger.entries, billIndex, repoRoot, now);
    if (!entry) continue;
    toUpsert.push(entry);
    ledger.entries = ledger.entries.filter((e) => e.id !== entry.id).concat(entry);
    if (before) updated++;
    else added++;
  }

  upsertClaimLedgerEntriesBatch(toUpsert, repoRoot);
  appendClaimLedgerAuditEvent(
    {
      eventType: "DEBATE_WEEK_SEED",
      claimId: null,
      actor: "debateClaimsSeed.v1",
      details: `Seeded ${added} new and ${updated} updated debate-week claims`,
    },
    repoRoot,
  );

  const totalDebate = loadClaimLedger(repoRoot).entries.filter((e) => e.domain === "debate").length;
  return { added, updated, totalDebate };
}

export function listDebateWeekClaims(repoRoot?: string): ClaimLedgerEntry[] {
  return loadClaimLedger(repoRoot).entries.filter(
    (e) => e.domain === "debate" || e.topicTags.includes(TAG_DEBATE_WEEK),
  );
}
