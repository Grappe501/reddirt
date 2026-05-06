/**
 * EMAIL-AI-AUDIENCE-STRATEGIST-1.0 — deterministic audience planning from approved facts + stated goals.
 * No OpenAI calls; no sends; no microtargeting on protected/sensitive attributes; no unsupported political claims.
 * Human approval required for drafts, lists, and sends elsewhere.
 */

import {
  explainAudienceCriteria,
  parseCriteria,
  type AudienceBuildingBlockRow,
  type AudienceClusterRow,
  type AudiencePreviewCriteria,
} from "@/lib/email-command-center/audience-studio";

const SENSITIVE_MICROTARGET_RE =
  /\b(race|ethnicity|religion|faith|disability|health|diagnosis|pregnant|sexual orientation|gender identity|citizenship status|national origin|voter file party|party affiliation)\b/i;

const OPPONENT_CLAIM_RE = /\b(opponent|attack ad|scandal|corrupt|illegal)\b/i;

export type CampaignAudienceGoalInput = {
  /** Primary message or mobilization goal in operator's own words. */
  messageGoal: string;
  /** Optional framing (e.g. county fair, GOTV window). */
  campaignContext?: string;
};

export type StrategistApprovedFactStub = {
  factType: string;
  factKey: string;
  factValue: string;
  profileCount: number;
};

export type SuggestedAudienceDefinition = {
  suggestedName: string;
  criteria: AudiencePreviewCriteria;
  rationale: string;
  /** Facts that should exist on profiles for this slice to be meaningful. */
  requiredFacts: Array<{ factKey: string; factValue: string; note: string }>;
};

export type AudienceRiskEvaluation = {
  usefulnessScore: number;
  riskLevel: "low" | "medium" | "high";
  riskNotes: string[];
  /** True when criteria look operationally fragile. */
  needsHumanReview: boolean;
};

export type AudienceBreadthAssessment = {
  posture: "ok" | "too_broad" | "too_thin" | "unknown";
  notes: string[];
};

export type MicrotargetClusterRecommendation = {
  label: string;
  kind: AudienceClusterRow["kind"];
  factKey?: string;
  factValue?: string;
  matchProfiles: number;
  safeForPlanning: boolean;
  note?: string;
};

export type AudienceStrategyReport = {
  goal: CampaignAudienceGoalInput;
  suggestedAudiences: SuggestedAudienceDefinition[];
  primaryCriteria: AudiencePreviewCriteria | null;
  primaryRationale: string[];
  requiredFacts: Array<{ factKey: string; factValue: string; reason: string }>;
  exclusionSuppressionConsiderations: string[];
  suggestedMessageAngles: string[];
  riskWarnings: string[];
  recommendedNextStep: string;
  riskEvaluation: AudienceRiskEvaluation;
  breadth: AudienceBreadthAssessment;
  clusterRecommendations: MicrotargetClusterRecommendation[];
};

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function isSensitiveText(s: string): boolean {
  return SENSITIVE_MICROTARGET_RE.test(s);
}

function blocksToApprovedStubs(blocks: AudienceBuildingBlockRow[]): StrategistApprovedFactStub[] {
  return blocks
    .filter((b): b is AudienceBuildingBlockRow & { kind: "approved_fact" } => b.kind === "approved_fact")
    .filter((b) => !isSensitiveText(`${b.factKey ?? ""} ${b.factValue ?? ""}`))
    .map((b) => ({
      factType: b.factType ?? "",
      factKey: b.factKey ?? "",
      factValue: (b.factValue ?? "").slice(0, 400),
      profileCount: b.profileOrSuggestionCount,
    }))
    .filter((b) => b.factKey || b.factValue);
}

/** Drop cluster / fact rows that imply sensitive microtargeting. */
export function recommendMicrotargetingClusters(
  clusters: AudienceClusterRow[],
  max = 12,
): MicrotargetClusterRecommendation[] {
  const out: MicrotargetClusterRecommendation[] = [];
  for (const c of clusters) {
    const label = `${c.label ?? ""} ${c.factKey ?? ""} ${c.factValue ?? ""}`;
    const sensitive = isSensitiveText(label);
    out.push({
      label: c.kind === "approved_hint_label" ? (c.label ?? "").slice(0, 200) : `${c.factKey ?? ""}: ${(c.factValue ?? "").slice(0, 120)}`,
      kind: c.kind,
      factKey: c.factKey,
      factValue: c.factValue,
      matchProfiles: c.matchProfiles,
      safeForPlanning: !sensitive && c.matchProfiles >= 2,
      note: sensitive
        ? "Excluded from automated cluster picks — sensitive-attribute posture; do not use for targeting."
        : c.matchProfiles < 5
          ? "Thin cluster — verify overlap before treating as a stable segment."
          : undefined,
    });
    if (out.length >= max) break;
  }
  return out;
}

export function buildAudienceSuppressionWarnings(goal: CampaignAudienceGoalInput, facts: StrategistApprovedFactStub[]): string[] {
  const lines: string[] = [
    "Honor SendGrid / ESP suppressions and consent flags before any future send — this strategist does not read suppression tables.",
    "Do not mail unsubscribed or legally restricted contacts — sync governance lives on SendGrid Foundation + Send Execution.",
  ];
  const corpus = norm(`${goal.messageGoal} ${goal.campaignContext ?? ""}`);
  if (/\b(donor|donation|finance|match)\b/i.test(corpus)) {
    lines.push("Fundraising-adjacent goal — finance + compliance sign-off required before donor-specific copy or urgency claims.");
  }
  if (/\b(volunteer|shift|canvass)\b/i.test(corpus)) {
    lines.push("Volunteer mobilization — confirm capacity and RSVP handling before promising dates or roles.");
  }
  const complianceFacts = facts.filter(
    (f) => /\bcompliance|suppression|unsubscribe|dnc\b/i.test(`${f.factKey} ${f.factValue}`),
  );
  if (complianceFacts.length) {
    lines.push("Approved facts include compliance/suppression-class signals — exclude those profiles from promotional sends unless cleared.");
  }
  return lines;
}

export function detectAudienceTooBroadOrTooThin(input: {
  criteria: AudiencePreviewCriteria;
  topBlockProfileCount?: number;
}): AudienceBreadthAssessment {
  const dims = [
    input.criteria.factKeyEquals,
    input.criteria.factValueEquals,
    input.criteria.factTypeEquals,
    input.criteria.county,
    input.criteria.city,
    input.criteria.audienceHintLabel,
    input.criteria.workflowSourceType,
  ].filter(Boolean).length;

  const notes: string[] = [];
  let posture: AudienceBreadthAssessment["posture"] = "ok";

  if (dims === 0) {
    posture = "too_broad";
    notes.push("No filters set — universe is effectively “any profile with approved facts” unless tightened.");
  } else if (dims === 1 && !input.criteria.factKeyEquals && !input.criteria.factValueEquals && !input.criteria.factTypeEquals) {
    posture = "too_broad";
    notes.push("Only geographic or workflow filters — consider adding at least one approved-fact dimension for clearer intent.");
  }

  const n = input.topBlockProfileCount;
  if (n != null && n < 15) {
    posture = posture === "too_broad" ? posture : "too_thin";
    notes.push(`Estimated reach from building blocks is small (${n} profiles on strongest single signal) — confirm before investing creative.`);
  } else if (n != null && n > 50_000) {
    notes.push("Large inferred universe — split tests and sampling recommended before single blast-style messaging.");
  }

  if (!notes.length) notes.push("Breadth looks reasonable for planning — still run Audience Studio preview counts.");
  return { posture, notes };
}

export function suggestAudienceMessageAngles(goal: CampaignAudienceGoalInput): string[] {
  const g = norm(goal.messageGoal);
  const angles: string[] = [
    "Lead with a verifiable shared value (service, transparency, turnout) tied to the approved facts you select — avoid unsourced numbers.",
    "Close with a single clear action (RSVP, reply, volunteer shift) matched to the audience’s strongest non-sensitive signal.",
  ];
  if (/\b(education|school|teacher)\b/i.test(g)) angles.push("Education frame: local outcomes + respectful tone; cite public sources only.");
  if (/\b(vote|ballot|election|turnout)\b/i.test(g)) angles.push("Participation frame: deadlines and nonpartisan how-to; do not imply eligibility.");
  if (/\b(county|local|town)\b/i.test(g)) angles.push("Local pride frame: county/city facts from profile graph only — no invented endorsements.");
  if (OPPONENT_CLAIM_RE.test(goal.messageGoal)) {
    angles.push(
      "GOVERNANCE: Opponent-specific language detected — strategist will not recommend attack claims; use counsel-vetted talking points only.",
    );
  }
  return angles;
}

export function evaluateAudienceRiskAndUsefulness(input: {
  criteria: AudiencePreviewCriteria;
  goal: CampaignAudienceGoalInput;
  topFact?: StrategistApprovedFactStub | null;
}): AudienceRiskEvaluation {
  const riskNotes: string[] = [];
  let riskLevel: AudienceRiskEvaluation["riskLevel"] = "low";
  let usefulnessScore = 0.55;

  const critStr = JSON.stringify(input.criteria);
  if (isSensitiveText(critStr)) {
    riskLevel = "high";
    riskNotes.push("Criteria text matched sensitive-attribute guard — do not use for targeting; revise with compliance.");
  }
  if (input.criteria.audienceHintLabel && input.criteria.audienceHintApprovedOnly === false) {
    riskLevel = "medium";
    riskNotes.push("Audience hints that are not APPROVED are not broadcast-eligible — tighten hint governance first.");
  }
  if (OPPONENT_CLAIM_RE.test(input.goal.messageGoal)) {
    riskLevel = riskLevel === "high" ? "high" : "medium";
    riskNotes.push("Goal references opponents — unsupported political claims are out of scope; editorial + counsel review required.");
  }
  if (input.topFact && input.topFact.profileCount >= 25) usefulnessScore += 0.15;
  if (input.criteria.factKeyEquals || input.criteria.factValueEquals) usefulnessScore += 0.12;
  if (input.criteria.minConfidence != null && input.criteria.minConfidence > 0.7) {
    usefulnessScore += 0.05;
    riskNotes.push("High minConfidence may thin the universe — check preview counts.");
  }
  usefulnessScore = Math.min(0.95, Math.max(0.12, Math.round(usefulnessScore * 100) / 100));

  const needsHumanReview = riskLevel !== "low" || riskNotes.length > 0;
  return { usefulnessScore, riskLevel, riskNotes, needsHumanReview };
}

export function suggestAudienceDefinitionsFromFacts(
  goal: CampaignAudienceGoalInput,
  facts: StrategistApprovedFactStub[],
): SuggestedAudienceDefinition[] {
  const sorted = [...facts].sort((a, b) => b.profileCount - a.profileCount);
  const out: SuggestedAudienceDefinition[] = [];
  const g = norm(goal.messageGoal);

  const push = (name: string, criteria: AudiencePreviewCriteria, rationale: string, required: SuggestedAudienceDefinition["requiredFacts"]) => {
    out.push({ suggestedName: name, criteria, rationale, requiredFacts: required });
  };

  const top = sorted[0];
  const second = sorted[1];

  if (top && !isSensitiveText(`${top.factKey} ${top.factValue}`)) {
    push(
      `Primary: ${top.factKey || "fact"} signal`,
      {
        factKeyEquals: top.factKey || undefined,
        factValueEquals: top.factValue ? top.factValue.slice(0, 500) : undefined,
        approvedFactsOnly: true,
        minConfidence: 0.35,
      },
      "Strongest recurring approved fact triple aligns with broad reach for your stated goal.",
      [{ factKey: top.factKey, factValue: top.factValue.slice(0, 200), note: "Profiles should carry this ACTIVE fact." }],
    );
  }

  const geoCorpus = norm(`${goal.messageGoal} ${goal.campaignContext ?? ""}`);
  if (/\b(pulaski|benton|washington|sebastian|garland)\b/i.test(geoCorpus) && top) {
    const county = `${goal.messageGoal} ${goal.campaignContext ?? ""}`.match(
      /\b([A-Za-z][a-z]+(?:\s[A-Za-z][a-z]+)?)\s+county\b/i,
    )?.[1];
    if (county) {
      push(
        `County slice: ${county}`,
        {
          county: county.trim(),
          factKeyEquals: top.factKey || undefined,
          approvedFactsOnly: true,
        },
        "Goal mentions geography — intersect strongest fact dimension with county filter (verify spelling against profile data).",
        [{ factKey: top.factKey, factValue: top.factValue.slice(0, 200), note: "County field must be populated on profiles." }],
      );
    }
  }

  if (second && top && second.factKey !== top.factKey && !isSensitiveText(`${second.factKey} ${second.factValue}`)) {
    push(
      "Narrow: stacked fact key",
      {
        factKeyEquals: second.factKey || undefined,
        factValueEquals: second.factValue ? second.factValue.slice(0, 500) : undefined,
        approvedFactsOnly: true,
        minConfidence: 0.45,
      },
      "Secondary signal for testing a tighter message variant — preview counts before locking creative.",
      [
        { factKey: top.factKey, factValue: top.factValue.slice(0, 200), note: "Consider sequential tests vs intersecting filters." },
        { factKey: second.factKey, factValue: second.factValue.slice(0, 200), note: "Optional second-axis test." },
      ],
    );
  }

  return out.slice(0, 5);
}

export function generateAudienceStrategyForGoal(
  goal: CampaignAudienceGoalInput,
  context: { buildingBlocks: AudienceBuildingBlockRow[]; clusters?: AudienceClusterRow[] },
): AudienceStrategyReport {
  const facts = blocksToApprovedStubs(context.buildingBlocks);
  const suggestedAudiences = suggestAudienceDefinitionsFromFacts(goal, facts);
  const primary = suggestedAudiences[0] ?? null;
  const topFact = facts[0] ?? null;

  const primaryCriteria = primary?.criteria ?? null;
  const riskEvaluation = evaluateAudienceRiskAndUsefulness({
    criteria: primaryCriteria ?? {},
    goal,
    topFact,
  });

  const breadth = detectAudienceTooBroadOrTooThin({
    criteria: primaryCriteria ?? {},
    topBlockProfileCount: topFact?.profileCount,
  });

  const exclusionSuppressionConsiderations = buildAudienceSuppressionWarnings(goal, facts);
  const suggestedMessageAngles = suggestAudienceMessageAngles(goal);
  const clusterRecommendations = recommendMicrotargetingClusters(context.clusters ?? []);

  const riskWarnings = [...riskEvaluation.riskNotes];
  if (breadth.posture === "too_broad") riskWarnings.push("Audience may be too broad for a single message arc.");
  if (breadth.posture === "too_thin") riskWarnings.push("Audience may be too thin for sustained paid/social spend — pair with acquisition.");
  riskWarnings.push("No unsupported opponent claims — use counsel-approved language only.");

  const requiredFacts =
    primary?.requiredFacts.map((r) => ({ factKey: r.factKey, factValue: r.factValue, reason: r.note })) ?? [];

  const primaryRationale = [
    primary?.rationale ?? "No strong approved-fact signal yet — approve more profile facts or imports first.",
    goal.campaignContext ? `Operator context: ${goal.campaignContext.slice(0, 400)}` : "",
  ].filter(Boolean);

  const recommendedNextStep = primary
    ? "Run Audience Studio preview with the suggested criteria, then save a draft definition with explicit operator review."
    : "Approve additional ACTIVE profile facts (or commit imports) so the strategist can anchor segments to governed data.";

  return {
    goal,
    suggestedAudiences,
    primaryCriteria,
    primaryRationale,
    requiredFacts,
    exclusionSuppressionConsiderations,
    suggestedMessageAngles,
    riskWarnings,
    recommendedNextStep,
    riskEvaluation,
    breadth,
    clusterRecommendations,
  };
}

export type AudienceDefinitionStrategistInput = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  criteriaJson: unknown;
};

export type MessageStudioAudienceStrategySummary = {
  definitionId: string;
  definitionName: string;
  status: string;
  criteriaSummaryLines: string[];
  /** Short bullets for Message Studio header */
  strategistBullets: string[];
  riskWarnings: string[];
  recommendedNextStep: string;
};

/** Build a compact summary when Message Studio is opened with `?audienceDefinitionId=`. */
export function buildAudienceStrategySummaryForDefinition(
  definition: AudienceDefinitionStrategistInput,
  buildingBlocks: AudienceBuildingBlockRow[],
  clusters?: AudienceClusterRow[],
): MessageStudioAudienceStrategySummary {
  const criteria = parseCriteria(definition.criteriaJson);
  const goal: CampaignAudienceGoalInput = {
    messageGoal: definition.name,
    campaignContext: definition.description ?? undefined,
  };
  const report = generateAudienceStrategyForGoal(goal, { buildingBlocks: buildingBlocks, clusters });
  const criteriaSummaryLines = explainAudienceCriteria(criteria);
  const strategistBullets = [
    ...report.suggestedMessageAngles.slice(0, 2),
    `Usefulness (heuristic): ${report.riskEvaluation.usefulnessScore.toFixed(2)} · Risk: ${report.riskEvaluation.riskLevel}`,
    `Breadth posture: ${report.breadth.posture}`,
  ];
  return {
    definitionId: definition.id,
    definitionName: definition.name,
    status: definition.status,
    criteriaSummaryLines,
    strategistBullets,
    riskWarnings: report.riskWarnings.slice(0, 8),
    recommendedNextStep: report.recommendedNextStep,
  };
}
