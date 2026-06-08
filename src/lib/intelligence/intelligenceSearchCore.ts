/**
 * Intelligence search core — query expansion, scoring, snippet extraction, intent boosts.
 */

export const INTEL_SEARCH_SUGGESTIONS = [
  "Hammer 2021 election package",
  "trap lane pivot when he bites",
  "verified claims election funding",
  "ACCA panel prep Jun 11",
  "three-way speak order",
  "Pakko contrast without smear",
  "stage safe NEEDS_REVIEW lines",
  "psychology under attack",
] as const;

/** v4 expanded suggestions — SRE + copilot + profile-aware defaults */
export const INTEL_SEARCH_SUGGESTIONS_V4 = [
  ...INTEL_SEARCH_SUGGESTIONS,
  "drill queue stage-safe cards",
  "run of show tonight",
  "rehearsal session launcher",
  "what not to say detector",
  "bridge line from trap to values",
  "session debrief notes",
  "live event ACCA countdown",
] as const;

/** Expand query with campaign-specific aliases so "Hammer" finds Kim Hammer modules, etc. */
const TERM_ALIASES: Record<string, string[]> = {
  hammer: ["kim hammer", "incumbent", "opponent", "kh-2", "kh-0"],
  pakko: ["michael packo", "packo", "libertarian", "third candidate"],
  kelly: ["grappe", "candidate"],
  sos: ["secretary of state", "office duties", "ballot access"],
  acca: ["county clerk", "clerks conference", "mountain view"],
  clerk: ["county clerk", "clerks", "acca"],
  trap: ["trap lane", "bait", "pivot", "setup question"],
  rehearse: ["rehearsal", "drill", "practice", "run-of-show"],
  claim: ["claims", "verified", "ledger", "needs_review"],
  funding: ["hava", "cvsgf", "election funding", "remittance"],
  fraud: ["election integrity", "security", "integrity package"],
  philosophy: ["handling", "rebuttal", "contrast", "debate briefing"],
  psychology: ["stage presence", "three-way", "atmosphere", "nerves"],
  opposition: ["hammer", "pakko", "contrast", "dossier"],
  debate: ["rehearsal", "stage", "panel", "three-way"],
  safe: ["stage-safe", "gated", "verify", "staff-verify"],
  film: ["video", "archive", "clip", "ledger"],
};

export type IntelSearchIntent =
  | "opposition"
  | "rehearse"
  | "claims"
  | "philosophy"
  | "clerks"
  | "general";

export function tokenizeIntelQuery(q: string): string[] {
  return [
    ...new Set(
      q
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 2),
    ),
  ].slice(0, 16);
}

export function expandIntelQueryTerms(terms: string[]): string[] {
  const expanded = new Set(terms);
  for (const t of terms) {
    for (const [key, aliases] of Object.entries(TERM_ALIASES)) {
      if (t === key || aliases.some((a) => a.includes(t) || t.includes(a.split(" ")[0]!))) {
        expanded.add(key);
        for (const a of aliases) expanded.add(a);
      }
    }
  }
  return [...expanded].slice(0, 28);
}

export function detectIntelSearchIntent(query: string, terms: string[]): IntelSearchIntent {
  const lower = query.toLowerCase();
  if (/\b(hammer|pakko|packo|opponent|contrast|dossier|offensive)\b/.test(lower)) return "opposition";
  if (/\b(rehears|drill|trap|sos question|encounter|speak.?order)\b/.test(lower)) return "rehearse";
  if (/\b(claim|verified|needs.?review|ledger|evidence)\b/.test(lower)) return "claims";
  if (/\b(philosophy|psychology|rebuttal|handling|briefing)\b/.test(lower)) return "philosophy";
  if (/\b(clerk|acca|vvsg|funding|hava|cvsgf)\b/.test(lower)) return "clerks";
  if (terms.some((t) => ["hammer", "pakko", "trap", "claim", "acca"].includes(t))) {
    if (terms.includes("hammer") || terms.includes("pakko")) return "opposition";
    if (terms.includes("trap")) return "rehearse";
    if (terms.includes("claim")) return "claims";
    if (terms.includes("acca")) return "clerks";
  }
  return "general";
}

const INTENT_KIND_BOOST: Record<IntelSearchIntent, Partial<Record<string, number>>> = {
  opposition: { offensive_move: 0.16, hammer_module: 0.14, trap_lane: 0.14, claim: 0.08, chunk: 0.06 },
  rehearse: { trap_lane: 0.16, sos_question: 0.14, debate_depth: 0.1, nav: 0.08 },
  claims: { claim: 0.2, citation: 0.1, field_book: 0.06 },
  philosophy: { debate_depth: 0.14, field_book: 0.12, nav: 0.08, glossary: 0.06 },
  clerks: { nav: 0.1, field_book: 0.08, sos_question: 0.08 },
  general: {},
};

export function intentBoostForKind(intent: IntelSearchIntent, kind: string): number {
  return INTENT_KIND_BOOST[intent][kind] ?? 0;
}

export function extractIntelSnippet(body: string, terms: string[], phrase: string, maxLen = 280): string {
  const clean = body.replace(/\s+/g, " ").trim();
  if (!clean.length) return "";
  const lower = clean.toLowerCase();
  const phraseLower = phrase.toLowerCase();

  let bestIdx = -1;
  let bestScore = -1;

  const anchors = [phraseLower, ...terms].filter((a) => a.length > 2);
  for (const anchor of anchors) {
    const idx = lower.indexOf(anchor);
    if (idx < 0) continue;
    const score = anchor === phraseLower ? 10 : anchor.length;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }

  if (bestIdx < 0) {
    return clean.slice(0, maxLen) + (clean.length > maxLen ? "…" : "");
  }

  const half = Math.floor(maxLen / 2);
  const start = Math.max(0, bestIdx - half);
  const end = Math.min(clean.length, start + maxLen);
  const slice = clean.slice(start, end);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < clean.length ? "…" : "";
  return `${prefix}${slice}${suffix}`;
}

export function scoreIntelDocument(
  title: string,
  body: string,
  terms: string[],
  expandedTerms: string[],
  phrase: string,
): number {
  const titleLower = title.toLowerCase();
  const bodyLower = body.toLowerCase();
  const phraseLower = phrase.toLowerCase();
  let score = 0;

  if (phrase.length > 2 && titleLower === phraseLower) score += 1.2;
  else if (phrase.length > 3 && titleLower.includes(phraseLower)) score += 0.65;

  if (phrase.length > 3 && bodyLower.includes(phraseLower)) score += 0.42;

  if (terms.length) {
    const titleHits = terms.filter((t) => titleLower.includes(t)).length;
    score += (titleHits / terms.length) * 0.38;
  }

  if (expandedTerms.length) {
    const bodyHits = expandedTerms.filter((t) => bodyLower.includes(t)).length;
    score += (bodyHits / expandedTerms.length) * 0.48;
  }

  return score;
}

export function highlightIntelMatches(text: string, terms: string[], phrase: string): string {
  if (!text) return text;
  const patterns = [phrase, ...terms].filter((p) => p.length > 2);
  if (!patterns.length) return text;
  const escaped = patterns
    .sort((a, b) => b.length - a.length)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  return text.replace(re, "⟨$1⟩");
}
