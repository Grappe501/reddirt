/**
 * EMAIL-AI-SOURCE-GROUNDING-LEDGER-1.0 — deterministic evidence layout for Message Studio AI advisory.
 * No external fact-checking, no invented URLs or document titles. If no operator sources, say so explicitly.
 */

export type AiSourceConfidence =
  | "source_backed"
  | "operator_context"
  | "inference"
  | "unsupported"
  | "unknown";

export type AiSourceReference = {
  id: string;
  /** Human label only — never a fabricated URL or citation */
  label: string;
  kind: "operator_paste" | "template_structure" | "campaign_voice_excerpt" | "none";
  snippet: string;
};

export type AiGroundedClaim = {
  text: string;
  confidence: AiSourceConfidence;
  referenceIds: string[];
};

export type AiUnsupportedClaim = {
  text: string;
  rationale: string;
};

export type AiInference = {
  text: string;
  rationale: string;
};

export type AiEvidenceLedger = {
  generatedAt: string;
  /** One-line honesty for operators */
  summaryLine: string;
  references: AiSourceReference[];
  operatorProvidedContext: string[];
  groundedClaims: AiGroundedClaim[];
  unsupportedClaims: AiUnsupportedClaim[];
  inferences: AiInference[];
  notices: string[];
};

export type BuildEvidenceLedgerInput = {
  audienceNote: string;
  complianceNotes: string;
  subjectGoal: string;
  primaryCta: string;
  sourceHints: string;
  existingBody: string;
  templateSummary?: string;
  voiceExcerpt: string;
  /** Parsed model fields (may be partial) */
  model: {
    emailBodyDraft?: string;
    subjectSuggestions?: string[];
    sourceBackedClaims?: { text: string; grounding?: string; note?: string }[];
    unsupportedClaims?: { text: string; reason?: string }[];
    inferences?: { text: string; rationale?: string }[];
    sourceBackedBullets?: string[];
    suggestedLanguageOnly?: string[];
  };
};

function refId(prefix: string, i: number): string {
  return `${prefix}-${i}`;
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

/** Build a bounded corpus of operator-provided strings (no invented sources). */
export function buildOperatorSourceCorpus(input: BuildEvidenceLedgerInput): string[] {
  const parts = [
    input.audienceNote,
    input.complianceNotes,
    input.subjectGoal,
    input.primaryCta,
    input.sourceHints,
    input.existingBody,
    input.templateSummary ?? "",
    input.voiceExcerpt,
  ].filter((x) => x.trim().length > 0);
  return parts;
}

/**
 * Heuristic sentence split — advisory only; not legal or journalistic fact extraction.
 */
export function extractPotentialClaims(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const chunks = t
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12 && s.length <= 400);
  const dedup = [...new Set(chunks)];
  return dedup.slice(0, 24);
}

/**
 * Classify a candidate line against operator-provided corpus only (substring / containment heuristics).
 */
export function classifyClaimGrounding(claim: string, sources: string[]): AiSourceConfidence {
  const c = norm(claim);
  if (c.length < 8) return "unknown";
  const needle = c.slice(0, Math.min(48, c.length));
  for (const src of sources) {
    const s = norm(src);
    if (!s) continue;
    if (s.includes(needle) || needle.includes(s.slice(0, Math.min(needle.length + 8, s.length)))) {
      return "operator_context";
    }
    const words = needle.split(" ").filter((w) => w.length > 4);
    const hits = words.filter((w) => s.includes(w));
    if (words.length >= 2 && hits.length >= Math.ceil(words.length * 0.6)) {
      return "source_backed";
    }
  }
  if (/\d{4}|%|\bpercent\b|\bpoll\b|\blegal\b|\boutcome\b|\bopponent\b/i.test(claim)) {
    return "unsupported";
  }
  return "inference";
}

export function createSourceLimitationNotice(context: {
  hasOperatorText: boolean;
  hasVoiceExcerpt: boolean;
  hasTemplateSummary: boolean;
  thinContext: boolean;
}): string[] {
  const lines: string[] = [];
  if (!context.hasOperatorText) {
    lines.push("No operator-provided notes or body were available — treat all factual specifics as ungrounded until you paste approved context.");
  }
  if (!context.hasVoiceExcerpt) {
    lines.push("Campaign Voice excerpt missing from ledger build — role framing may be thin.");
  }
  if (!context.hasTemplateSummary) {
    lines.push("No production template summary was attached to this run — template structure was not an additional source.");
  }
  if (context.thinContext) {
    lines.push("Thin context: fewer than two source layers or short notes — AI specifics are more likely to be under-grounded.");
  }
  lines.push("No SearchChunk / semantic RAG retrieval was performed for this ledger — sources are operator paste + voice excerpt + template summary only.");
  return lines;
}

export function buildEvidenceLedger(input: BuildEvidenceLedgerInput): AiEvidenceLedger {
  const corpus = buildOperatorSourceCorpus(input);
  const references: AiSourceReference[] = [];
  let ri = 0;
  const pushRef = (label: string, kind: AiSourceReference["kind"], snippet: string) => {
    const sn = clip(snippet, 220);
    if (!sn) return;
    references.push({ id: refId("ref", ri++), label, kind, snippet: sn });
  };
  if (input.audienceNote.trim()) pushRef("Audience note", "operator_paste", input.audienceNote);
  if (input.complianceNotes.trim()) pushRef("Compliance notes", "operator_paste", input.complianceNotes);
  if (input.subjectGoal.trim()) pushRef("Subject / angle goal", "operator_paste", input.subjectGoal);
  if (input.primaryCta.trim()) pushRef("Primary CTA", "operator_paste", input.primaryCta);
  if (input.sourceHints.trim()) pushRef("Source hints (non-secret)", "operator_paste", input.sourceHints);
  if (input.existingBody.trim()) pushRef("Existing draft body", "operator_paste", input.existingBody);
  if (input.templateSummary?.trim()) pushRef("Production template summary", "template_structure", input.templateSummary);
  if (input.voiceExcerpt.trim()) pushRef("Campaign Voice excerpt (caller-supplied)", "campaign_voice_excerpt", input.voiceExcerpt);

  const operatorProvidedContext = corpus.map((c) => clip(c, 160)).filter(Boolean);

  const body = input.model.emailBodyDraft ?? "";
  const subjects = (input.model.subjectSuggestions ?? []).join(" ");
  const claimsPool = extractPotentialClaims(`${body}\n${subjects}`);

  const groundedClaims: AiGroundedClaim[] = [];
  const unsupportedClaims: AiUnsupportedClaim[] = [];
  const inferences: AiInference[] = [];

  const fromModel = input.model.sourceBackedClaims ?? [];
  for (const row of fromModel) {
    const text = typeof row === "object" && row && "text" in row ? String(row.text).trim() : "";
    if (!text) continue;
    const g = classifyClaimGrounding(text, corpus);
    const refIds = references.filter((r) => norm(r.snippet).length && norm(text).includes(norm(r.snippet).slice(0, 24))).map((r) => r.id);
    groundedClaims.push({ text, confidence: g === "unsupported" ? "unsupported" : g, referenceIds: refIds });
  }

  if (fromModel.length === 0) {
    for (const b of input.model.sourceBackedBullets ?? []) {
      const text = String(b).trim();
      if (!text) continue;
      const g = classifyClaimGrounding(text, corpus);
      groundedClaims.push({
        text,
        confidence: g,
        referenceIds: references.map((r) => r.id).slice(0, 1),
      });
    }
  }

  const um = input.model.unsupportedClaims ?? [];
  for (const u of um) {
    const text = typeof u === "object" && u && "text" in u ? String(u.text).trim() : "";
    if (!text) continue;
    unsupportedClaims.push({
      text: clip(text, 280),
      rationale: typeof u === "object" && u && "reason" in u && String(u.reason).trim() ? String(u.reason).trim() : "Model flagged as unsupported — operator review required.",
    });
  }

  /** Optional heuristic only when model supplied none — bounded, not a fact-checker. */
  if (unsupportedClaims.length === 0) {
    let added = 0;
    const seen = new Set<string>();
    for (const sentence of claimsPool) {
      if (added >= 5) break;
      if (classifyClaimGrounding(sentence, corpus) !== "unsupported") continue;
      const key = norm(sentence);
      if (seen.has(key)) continue;
      seen.add(key);
      unsupportedClaims.push({
        text: clip(sentence, 280),
        rationale:
          "Heuristic: numeric/legal/political intensity language not clearly present in operator-provided corpus — verify or remove.",
      });
      added += 1;
    }
  }

  const inf = input.model.inferences ?? [];
  for (const row of inf) {
    const text = typeof row === "object" && row && "text" in row ? String(row.text).trim() : "";
    if (!text) continue;
    inferences.push({
      text: clip(text, 280),
      rationale:
        typeof row === "object" && row && "rationale" in row && String(row.rationale).trim()
          ? String(row.rationale).trim()
          : "Advisory inference from model — not a verified fact.",
    });
  }

  const hasOperatorText = corpus.length > 0;
  const notices = createSourceLimitationNotice({
    hasOperatorText,
    hasVoiceExcerpt: Boolean(input.voiceExcerpt.trim()),
    hasTemplateSummary: Boolean(input.templateSummary?.trim()),
    thinContext: !hasOperatorText || corpus.join(" ").length < 120,
  });

  const summaryLine = hasOperatorText
    ? `Evidence ledger: ${references.length} reference slice(s) from operator/template/voice inputs only — no external retrieval.`
    : "Evidence ledger: no operator sources were present — all draft claims require human sourcing before externalization.";

  return {
    generatedAt: new Date().toISOString(),
    summaryLine,
    references,
    operatorProvidedContext,
    groundedClaims: groundedClaims.slice(0, 20),
    unsupportedClaims: unsupportedClaims.slice(0, 16),
    inferences: inferences.slice(0, 16),
    notices,
  };
}

export type EvidenceLedgerUiBlock = { title: string; items: string[] };

export function formatEvidenceLedgerForUi(ledger: AiEvidenceLedger): { headline: string; blocks: EvidenceLedgerUiBlock[] } {
  const blocks: EvidenceLedgerUiBlock[] = [];
  blocks.push({
    title: "Summary",
    items: [ledger.summaryLine, ...ledger.notices.slice(0, 6)],
  });
  if (ledger.references.length) {
    blocks.push({
      title: "Source references (operator / template / voice only)",
      items: ledger.references.map((r) => `${r.label} [${r.kind}]: ${r.snippet}`),
    });
  } else {
    blocks.push({ title: "Source references", items: ["No sources recorded — paste approved context before trusting specifics."] });
  }
  if (ledger.operatorProvidedContext.length) {
    blocks.push({
      title: "Operator-provided context (truncated)",
      items: ledger.operatorProvidedContext,
    });
  }
  if (ledger.groundedClaims.length) {
    blocks.push({
      title: "Grounded / classified lines (heuristic)",
      items: ledger.groundedClaims.map((g) => `${g.confidence.toUpperCase()}: ${g.text}`),
    });
  }
  if (ledger.unsupportedClaims.length) {
    blocks.push({
      title: "Unsupported or high-risk lines (require review)",
      items: ledger.unsupportedClaims.map((u) => `${u.text} — ${u.rationale}`),
    });
  }
  if (ledger.inferences.length) {
    blocks.push({
      title: "Inferences (not verified facts)",
      items: ledger.inferences.map((i) => `${i.text} — ${i.rationale}`),
    });
  }
  return { headline: "Evidence ledger (advisory)", blocks };
}

export function buildUnsupportedClaimWarnings(ledger: AiEvidenceLedger): string[] {
  const w: string[] = [];
  if (ledger.unsupportedClaims.length) {
    w.push(`${ledger.unsupportedClaims.length} unsupported or high-risk candidate line(s) — resolve before send governance.`);
  }
  for (const u of ledger.unsupportedClaims.slice(0, 5)) {
    w.push(`Review: ${clip(u.text, 120)}`);
  }
  if (!ledger.references.length) {
    w.push("No source references — unsupported-claim review is especially critical.");
  }
  return w;
}
