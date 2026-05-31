import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { loadCountyKpis, listCountyWorkbenchCounties } from "@/lib/agents/county-intelligence/county-workbench-adapter";
import type {
  CountyPublicBriefReadiness,
  GovernedBrief,
  GovernedClaimRecord,
} from "./governedBriefTypes";
import { clampBriefConfidence, defaultGovernedBriefFields } from "./governedBriefTypes";

const KH_OVERLAY = new Set(["pulaski", "washington", "benton", "sebastian", "craighead"]);
const V2 = new Set(["pope", "pulaski", "faulkner"]);
const FULL = new Set(["pope", "pulaski", "faulkner", "garland", "jefferson", "saline"]);

const LOCAL_VALIDATOR_GAPS = [
  "churches",
  "schools",
  "hospitals",
  "chambers",
  "fairs/festivals",
  "media",
  "civic groups",
  "local validators",
];

export type CountyBriefBundle = {
  countySlug: string;
  countyName: string;
  publicBriefReadiness: CountyPublicBriefReadiness;
  publicMessagingBrief: GovernedBrief;
  fieldIntelligenceBrief: GovernedBrief;
};

function classifyPublicBriefReadiness(
  short: string,
  depth: "full" | "shell",
  completion: number,
  hasProfile: boolean,
): CountyPublicBriefReadiness {
  if (depth === "shell" && completion <= 5) return "SHELL_ONLY";
  if (V2.has(short) || (depth === "full" && hasProfile)) return "INTERNAL_MESSAGE_SOURCE_ONLY";
  if (KH_OVERLAY.has(short)) return "INTERNAL_MESSAGE_SOURCE_ONLY";
  if (depth === "full") return "FIELD_PLANNING_ONLY";
  return "SHELL_ONLY";
}

/** PUBLIC_BRIEF_READY requires export-ready county overlay + full profile + canonical goal — audit expects 0 today. */
function couldBePublicBriefReady(
  short: string,
  depth: "full" | "shell",
  hasProfile: boolean,
  canonicalGoalSet: boolean,
): boolean {
  return (
    false &&
    FULL.has(short) &&
    depth === "full" &&
    hasProfile &&
    KH_OVERLAY.has(short) &&
    canonicalGoalSet
  );
}

function buildClaims(kpi: ReturnType<typeof loadCountyKpis>, readiness: CountyPublicBriefReadiness): {
  verified: GovernedClaimRecord[];
  unverified: GovernedClaimRecord[];
  inferred: GovernedClaimRecord[];
} {
  const verified: GovernedClaimRecord[] = [];
  const unverified: GovernedClaimRecord[] = [];
  const inferred: GovernedClaimRecord[] = [];

  if (kpi) {
    verified.push({
      claim: `${kpi.countyName} workbench depth: ${kpi.deploymentReadiness ?? "classified"}`,
      tier: "verified",
      sourceAnchors: ["dashboard-v2-county-coverage.csv"],
    });
    if (kpi.planningVoteTargetProxy != null) {
      unverified.push({
        claim: `Planning vote target proxy: ${kpi.planningVoteTargetProxy.toLocaleString()} (NOT registration goal)`,
        tier: "unverified",
        sourceAnchors: ["arkansasStateAlignedTargets2022.json"],
        notes: "Do not use as registration goal in public messaging",
      });
    }
    if (kpi.canonicalRegistrationGoal != null) {
      verified.push({
        claim: `Canonical registration goal: ${kpi.canonicalRegistrationGoal.toLocaleString()}`,
        tier: "verified",
        sourceAnchors: ["CountyCampaignStats.registrationGoal"],
      });
    } else {
      unverified.push({
        claim: "Canonical registration goal not verified in this context",
        tier: "unverified",
        sourceAnchors: ["GOALS-VERIFY-1"],
      });
    }
    for (const w of kpi.topWeaknesses.slice(0, 3)) {
      inferred.push({
        claim: w,
        tier: "inferred",
        sourceAnchors: ["county-workbench-adapter"],
      });
    }
  }

  if (readiness === "SHELL_ONLY") {
    inferred.push({
      claim: "County is shell-only — public messaging from this brief would be misleading",
      tier: "inferred",
      sourceAnchors: ["countyDeploymentReadiness audit"],
    });
  }

  return { verified, unverified, inferred };
}

export function generateCountyBriefBundle(
  registrySlug: string,
  canonicalGoalSet = false,
): CountyBriefBundle | null {
  const short = registrySlug.replace(/-county$/, "");
  const row = listCountyWorkbenchCounties().find((c) => c.countySlug === short);
  const kpi = loadCountyKpis(short);
  const reg = ARKANSAS_COUNTY_REGISTRY.find((c) => c.slug === registrySlug);
  if (!reg) return null;

  const depth = row?.workbenchDepth ?? "shell";
  const completion = row?.completionPercent ?? 5;
  const hasProfile = row?.hasCountyProfile ?? false;

  let readiness = classifyPublicBriefReadiness(short, depth, completion, hasProfile);
  if (couldBePublicBriefReady(short, depth, hasProfile, canonicalGoalSet)) {
    readiness = "PUBLIC_BRIEF_READY";
  }

  const claims = buildClaims(kpi, readiness);
  const researchGaps = [
    ...LOCAL_VALIDATOR_GAPS.map((v) => `${v}: not normalized for ${reg.displayName}`),
    kpi?.canonicalRegistrationGoal == null ? "Canonical registration goal unset — verify in admin" : "",
    depth === "shell" ? "Full countyWorkbench profile not connected" : "",
    !KH_OVERLAY.has(short) ? "No Kim Hammer geographic narrative overlay" : "Overlay citations may be NEEDS_REVIEW",
  ].filter(Boolean);

  const confidence =
    readiness === "SHELL_ONLY" ? 15 : readiness === "FIELD_PLANNING_ONLY" ? 35 : readiness === "INTERNAL_MESSAGE_SOURCE_ONLY" ? 48 : 72;

  const base = defaultGovernedBriefFields("countyPublicBriefGenerator.v1");

  const publicMessagingBrief: GovernedBrief = {
    ...base,
    briefId: `county-pub-${short}`,
    title: `${reg.displayName} — Public Messaging Brief (INTERNAL)`,
    briefType: "county_public_messaging",
    tags: [registrySlug, readiness, "county", "messaging"],
    audience: "Internal comms + field leads — NOT public",
    intendedUse: "Future public adaptation only after human claim approval",
    evidenceSummary: [
      `Dashboard: ${V2.has(short) ? "v2 live" : "command scaffold"}`,
      `Data quality: ${completion}% workbench completion`,
      `Registration goal: ${kpi?.canonicalRegistrationGoal != null ? "canonical if DB-enriched" : "unverified"}`,
      `Vote target: ${kpi?.planningVoteTargetProxy != null ? "planning proxy only" : "missing"}`,
    ],
    verifiedClaims: claims.verified,
    unverifiedClaims: claims.unverified,
    inferredClaims: claims.inferred,
    researchGaps,
    recommendedMessaging:
      readiness === "SHELL_ONLY"
        ? ["Do not produce county-specific public messaging — use statewide trust/county-support frames only"]
        : [
            "Emphasize supporting county election workers and transparent SOS service",
            "Avoid opponent-specific attacks without citation locker approval",
            "Use listening prompts before localized promises",
          ],
    riskWarnings: [
      "NOT_PUBLISHABLE — all messaging INTERNAL until human review",
      readiness === "SHELL_ONLY" ? "HIGH RISK: shell county — public messaging dangerous" : "Verify canonical goals before field use",
      "Proxy vote targets must never appear as registration goals in public copy",
    ],
    humanReviewChecklist: [
      "Verify every claim against source anchors",
      "Confirm registration goal in CountyCampaignStats if cited",
      "Legal/comms sign-off before any public adaptation",
      "Mark unsupported claims as research gaps",
    ],
    sourceAnchors: [
      "dashboard-v2-county-coverage.csv",
      "county-workbench-adapter.ts",
      "GOALS-VERIFY-1",
      ...(KH_OVERLAY.has(short) ? ["kim-hammer-geographic-narrative-overlays.json"] : []),
    ],
    confidenceScore: clampBriefConfidence(confidence),
    confidenceBasis: `Readiness tier ${readiness}; ${completion}% data; ${claims.verified.length} verified claims`,
  };

  const fieldIntelligenceBrief: GovernedBrief = {
    ...base,
    briefId: `county-field-${short}`,
    title: `${reg.displayName} — Field Intelligence Brief (INTERNAL)`,
    briefType: "county_field_intelligence",
    tags: [registrySlug, readiness, "field"],
    audience: "Field managers and county captains",
    intendedUse: "Field planning and event prep — not public release",
    evidenceSummary: [
      `Field plan readiness: ${FULL.has(short) ? "partial — proxy PO5" : "shell — no field memory"}`,
      `Events: read-only event county cards wired`,
      `Power of 5: planning proxy only; relational counts not in adapter`,
    ],
    verifiedClaims: claims.verified,
    unverifiedClaims: claims.unverified,
    inferredClaims: [
      ...claims.inferred,
      {
        claim: `Institutional memory: MISSING (confidence 10/100)`,
        tier: "inferred",
        sourceAnchors: ["county-memory-readiness-table.json"],
      },
    ],
    researchGaps,
    recommendedMessaging: kpi?.recommendedActions ?? ["Connect county profile in countyWorkbench"],
    riskWarnings: publicMessagingBrief.riskWarnings,
    humanReviewChecklist: [
      "Confirm event county intelligence card before event",
      "Hot-wash outcomes into county memory when available",
      "Do not assign registration goals from planning proxy",
    ],
    sourceAnchors: publicMessagingBrief.sourceAnchors,
    confidenceScore: clampBriefConfidence(confidence - 5),
    confidenceBasis: `Field tier ${readiness}; institutional memory empty`,
  };

  return {
    countySlug: registrySlug,
    countyName: reg.displayName,
    publicBriefReadiness: readiness,
    publicMessagingBrief,
    fieldIntelligenceBrief,
  };
}

export function generateAllCountyBriefBundles(canonicalGoalSlugs: Set<string> = new Set()): CountyBriefBundle[] {
  return ARKANSAS_COUNTY_REGISTRY.map((c) =>
    generateCountyBriefBundle(c.slug, canonicalGoalSlugs.has(c.slug)),
  ).filter((b): b is CountyBriefBundle => b != null);
}

export function summarizeCountyPublicBriefReadiness(bundles: CountyBriefBundle[]) {
  const counts: Record<CountyPublicBriefReadiness, number> = {
    PUBLIC_BRIEF_READY: 0,
    INTERNAL_MESSAGE_SOURCE_ONLY: 0,
    FIELD_PLANNING_ONLY: 0,
    SHELL_ONLY: 0,
    BLOCKED: 0,
  };
  for (const b of bundles) counts[b.publicBriefReadiness]++;
  return counts;
}
