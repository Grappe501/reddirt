/**
 * Deterministic, rules-first analysis for public `ConversationItem` signals.
 * TODO(ai): Pluggable `analyzeWithProvider` — same I/O, replace body of `runDeterministicAnalysis`.
 */
import type {
  ConversationClassification,
  ConversationItem,
  ConversationSentimentLabel,
  ConversationSourceKind,
  ConversationSuggestedTone,
  ConversationUrgency,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export const CONVERSATION_ANALYZER_VERSION = "rules-v1";

export type DeterministicAnalysisOutput = {
  summary: string;
  classification: ConversationClassification;
  sentiment: ConversationSentimentLabel;
  urgency: ConversationUrgency;
  suggestedTone: ConversationSuggestedTone;
  issueTags: string[];
  countyInferenceNote: string | null;
  suggestedAction: string;
  confidenceJson: Record<string, unknown>;
};

const POS = /\b(love|support|great|thank|proud|hope|win|join|volunteer|rsvp|yes|amazing|excellent|good|best)\b/gi;
const NEG = /\b(worst|hate|fail|terrible|awful|corrupt|lie|liar|never|stop|angry|disappointed|fraud|broken)\b/gi;
const Q = /\?|(\b(how|what|when|where|why|who|can you|does anyone|is it true|confused|don't understand|unclear)\b)/gi;
const URGENT = /\b(breaking|urgent|now|tonight|deadline|last day|asap|immediately|just in)\b/gi;
const VOTE = /\b(ballot|vote|voting|poll|turnout|register|absentee|early vote|suppression)\b/gi;
const HEALTH = /\b(medicaid|hospital|health|clinic|covid|drug|insurance|medicare|mental health)\b/gi;
const ECON = /\b(job|jobs|economy|wage|inflation|tax|business|unemployment|minimum wage)\b/gi;
const EDU = /\b(school|teacher|student|education|funding|classroom|curriculum|college)\b/gi;
const INFRA = /\b(road|bridge|water|broadband|infrastructure|grid|flood|power)\b/gi;
const MIS = /\b(fake|false claim|debunk|misinfo|rumor|hoax|conspiracy|doctored)\b/gi;
const PRESS = /\b(arkansas democrat|arktimes|kark|thv11|ap news|reporter|editorial|press release)\b/gi;
const COUNTY_W = /\b(pulaski|benton|washington|sebastian|faulkner|garland|jefferson|craighead|mississippi|white county)\b/gi;

function clampSummary(text: string, max = 500): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

/**
 * @param watchlistFilterHint — optional JSON from watchlist.filterSpec (keyword hints only).
 */
export async function runDeterministicAnalysis(
  item: Pick<
    ConversationItem,
    "id" | "sourceKind" | "channel" | "title" | "bodyText" | "countyId" | "watchlistId"
  >,
  options?: { watchlistFilterHint?: unknown }
): Promise<DeterministicAnalysisOutput> {
  const text = [item.title, item.bodyText].filter(Boolean).join(" — ");
  const keywordHits: string[] = [];

  const addHit = (name: string, re: RegExp) => {
    re.lastIndex = 0;
    if (re.test(text)) keywordHits.push(name);
  };
  addHit("vote", VOTE);
  addHit("health", HEALTH);
  addHit("economy", ECON);
  addHit("education", EDU);
  addHit("infra", INFRA);
  addHit("misinfo", MIS);
  addHit("press", PRESS);
  addHit("urgent", URGENT);
  addHit("county_mention", COUNTY_W);

  const pCount = (text.match(POS) ?? []).length;
  const nCount = (text.match(NEG) ?? []).length;

  let classification: ConversationClassification = "NEUTRAL_REPORT";
  if (MIS.test(text) || /misinfo|rumor|hoax/i.test(text)) {
    classification = "MISINFO_RISK";
  } else if (Q.test(text) || /\b(wonder|confus|clarif|not sure|anyone know)\b/i.test(text)) {
    classification = "QUESTION";
  } else if (nCount > pCount + 1) {
    classification = "CRITIQUE";
  } else if (pCount > 0 && nCount === 0) {
    classification = "SUPPORT";
  } else if (VOTE.test(text)) {
    classification = "ISSUE_VOTING";
  } else if (HEALTH.test(text)) {
    classification = "ISSUE_HEALTH";
  } else if (ECON.test(text)) {
    classification = "ISSUE_ECONOMY";
  } else if (EDU.test(text)) {
    classification = "ISSUE_EDUCATION";
  } else if (INFRA.test(text)) {
    classification = "ISSUE_INFRA";
  } else if (PRESS.test(text) || item.sourceKind === "NEWS_SITE" || item.sourceKind === "PRESS_RELEASE") {
    classification = "NEUTRAL_REPORT";
  } else if (item.channel.toLowerCase().includes("x") || item.channel.toLowerCase().includes("facebook")) {
    classification = "ISSUE_LOCAL";
  }

  let sentiment: ConversationSentimentLabel = "NEUTRAL";
  if (pCount > nCount + 1) sentiment = "POSITIVE";
  else if (nCount > pCount + 1) sentiment = "NEGATIVE";
  else if (pCount > 0 && nCount > 0) sentiment = "MIXED";

  let urgency: ConversationUrgency = "MEDIUM";
  if (URGENT.test(text) || /breaking|alert/i.test(item.title ?? "")) {
    urgency = "BREAKING";
  } else if (VOTE.test(text) && /today|tonight|tomorrow|deadline/i.test(text)) {
    urgency = "HIGH";
  } else if (classification === "MISINFO_RISK" || (classification === "QUESTION" && MIS.test(text))) {
    urgency = "HIGH";
  } else {
    urgency = "LOW";
  }

  let suggestedTone: ConversationSuggestedTone = "FACTUAL";
  if (sentiment === "POSITIVE" || classification === "SUPPORT") {
    suggestedTone = "CELEBRATORY";
  } else if (sentiment === "NEGATIVE" || classification === "CRITIQUE") {
    suggestedTone = "EMPATHETIC";
  } else if (classification === "MISINFO_RISK") {
    suggestedTone = "FIRM";
  } else if (classification === "QUESTION") {
    suggestedTone = "CALM";
  }

  const issueTags: string[] = [];
  if (keywordHits.includes("vote")) issueTags.push("voting");
  if (keywordHits.includes("health")) issueTags.push("health");
  if (keywordHits.includes("economy")) issueTags.push("economy");
  if (keywordHits.includes("education")) issueTags.push("education");
  if (Q.test(text) || /\b(wonder|anyone know)\b/i.test(text)) {
    if (/\bconfus|not sure|anyone know\b/i.test(text)) issueTags.push("confusion_signal");
    else if (Q.test(text)) issueTags.push("curious_question");
  }
  if (keywordHits.includes("press") || item.sourceKind === "NEWS_SITE") {
    issueTags.push("media_interest");
  }
  if (MIS.test(text) || classification === "MISINFO_RISK") {
    issueTags.push("correction_candidate");
  }
  if (POS.test(text) && /volunteer|join|rsvp|event/i.test(text)) {
    issueTags.push("supporter_rising");
  }

  let countyInferenceNote: string | null = null;
  let inferredCountyId: string | null = item.countyId;
  if (!inferredCountyId) {
    const counties = await prisma.county.findMany({
      where: { published: true },
      select: { id: true, displayName: true },
      take: 200,
    });
    for (const c of counties) {
      if (c.displayName.length > 3 && new RegExp(`\\b${escapeRegExp(c.displayName)}\\b`, "i").test(text)) {
        countyInferenceNote = `Text mentions ${c.displayName} — possible county signal (inferred, verify before routing).`;
        inferredCountyId = c.id;
        break;
      }
    }
  } else {
    const co = await prisma.county.findUnique({ where: { id: item.countyId! }, select: { displayName: true } });
    if (co) {
      countyInferenceNote = `Item is linked to ${co.displayName} (watchlist/ingest).`;
    }
  }

  if (options?.watchlistFilterHint && typeof options.watchlistFilterHint === "object") {
    issueTags.push("watchlist_scoped");
  }

  const summary = clampSummary(
    classification === "QUESTION"
      ? `Public question thread (signal): ${item.title || item.bodyText.slice(0, 120)}…`
      : `Public ${item.channel} signal: ${item.title || item.bodyText.slice(0, 120)}…`
  );
  const suggestedAction =
    classification === "MISINFO_RISK"
      ? "Prepare a calm, factual correction or link to an approved explainer; avoid amplifying the false claim in headlines."
      : classification === "QUESTION" && issueTags.includes("confusion_signal")
        ? "Draft a short FAQ or comment-thread clarification; route to comms for tone."
        : classification === "SUPPORT" && issueTags.includes("supporter_rising")
          ? "Surface for volunteer or event follow-up; thank-you tone if you reply publicly."
          : issueTags.includes("media_interest")
            ? "Rapid comms triage: verify facts and decide if a statement or post is warranted."
            : "Log for tracking; use workbench actions if a public response is needed.";

  const confidenceJson: Record<string, unknown> = {
    engine: "deterministic",
    version: CONVERSATION_ANALYZER_VERSION,
    keywordHits,
    inferredCountyId,
    // TODO(ai): { provider, model, scores }
  };

  return {
    summary,
    classification,
    sentiment,
    urgency,
    suggestedTone,
    issueTags: [...new Set(issueTags)].slice(0, 20),
    countyInferenceNote,
    suggestedAction,
    confidenceJson,
  };
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
